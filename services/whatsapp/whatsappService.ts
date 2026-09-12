import { randomInt } from "crypto";
import { telefoneWhatsappRepository } from "@/repositories/telefoneWhatsappRepository";
import { mensagemWhatsappRepository } from "@/repositories/mensagemWhatsappRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { receitaService } from "@/services/financeiro/receitaService";
import { despesaService } from "@/services/financeiro/despesaService";
import { dashboardService } from "@/services/dashboard/dashboardService";
import { interpretarMensagem } from "@/services/whatsapp/mensagemParserService";
import { obterProvedorConfigurado } from "@/services/whatsapp/whatsappProviderInterface";
import { formatarMoeda } from "@/lib/format";
import { ValidationError } from "@/lib/errors";

const DURACAO_CODIGO_MS = 15 * 60 * 1000;
const MENSAGEM_AJUDA =
  'Comandos: "gastei 50 no mercado", "recebi 1000 de salário", "saldo". Cada mensagem vira um lançamento automático na sua conta FinanceOps.';

function gerarCodigo(): string {
  return `FINOPS-${randomInt(1000, 9999)}`;
}

function normalizarNumero(numero: string): string {
  return numero.replace(/[^\d+]/g, "");
}

async function enviarResposta(numero: string, texto: string): Promise<void> {
  const provedor = obterProvedorConfigurado();
  if (!provedor) return; // sem provedor configurado: o comando já foi processado, só a resposta não sai
  await provedor.enviarMensagem(numero, texto).catch(() => {});
}

export const whatsappService = {
  async iniciarVinculo(userId: string, numeroBruto: string) {
    const numero = normalizarNumero(numeroBruto);
    if (numero.replace("+", "").length < 8) {
      throw new ValidationError("Número de telefone inválido.");
    }

    const existente = await telefoneWhatsappRepository.buscarPorNumero(numero);
    if (existente && existente.userId !== userId && existente.verificado) {
      throw new ValidationError("Este número já está vinculado a outra conta.", "NUMERO_EM_USO");
    }

    const codigo = gerarCodigo();
    const expiraEm = new Date(Date.now() + DURACAO_CODIGO_MS);
    await telefoneWhatsappRepository.iniciarVinculo(userId, numero, codigo, expiraEm);
    await auditLogRepository.create({ userId, action: "WHATSAPP_VINCULO_INICIADO", entity: "TelefoneWhatsapp" });

    return { numero, codigo, expiraEm };
  },

  async status(userId: string) {
    const telefone = await telefoneWhatsappRepository.buscarPorUsuario(userId);
    if (!telefone) return { vinculado: false, verificado: false, numero: null as string | null };
    return { vinculado: true, verificado: telefone.verificado, numero: telefone.numero };
  },

  async desvincular(userId: string) {
    await telefoneWhatsappRepository.remover(userId);
    await auditLogRepository.create({ userId, action: "WHATSAPP_DESVINCULADO", entity: "TelefoneWhatsapp" });
  },

  /**
   * Processa uma mensagem recebida via webhook. Fluxo: confirma a
   * verificação do número se pendente; senão interpreta o comando e
   * registra o lançamento correspondente, respondendo pelo provedor
   * configurado (se houver).
   */
  async processarMensagemRecebida(numeroBruto: string, texto: string): Promise<void> {
    const numero = normalizarNumero(numeroBruto);
    const telefone = await telefoneWhatsappRepository.buscarPorNumero(numero);

    if (telefone && !telefone.verificado) {
      const codigoValido =
        telefone.codigoVerificacao === texto.trim().toUpperCase() &&
        !!telefone.codigoExpiraEm &&
        telefone.codigoExpiraEm > new Date();

      await mensagemWhatsappRepository.create({
        userId: telefone.userId,
        numero,
        direcao: "ENTRADA",
        conteudo: texto,
        intencao: "VERIFICACAO",
        processadoComSucesso: codigoValido,
      });

      if (codigoValido) {
        await telefoneWhatsappRepository.confirmarVinculo(telefone.id);
        await auditLogRepository.create({
          userId: telefone.userId,
          action: "WHATSAPP_VINCULADO",
          entity: "TelefoneWhatsapp",
        });
        await enviarResposta(numero, "Número vinculado com sucesso! Agora você pode registrar receitas e despesas por aqui.");
      } else {
        await enviarResposta(numero, "Código de verificação inválido ou expirado. Gere um novo código no FinanceOps.");
      }
      return;
    }

    if (!telefone || !telefone.verificado) {
      await mensagemWhatsappRepository.create({
        userId: null,
        numero,
        direcao: "ENTRADA",
        conteudo: texto,
        intencao: "NAO_VINCULADO",
        processadoComSucesso: false,
      });
      await enviarResposta(numero, "Este número ainda não está vinculado a uma conta FinanceOps. Acesse o app para vincular.");
      return;
    }

    const userId = telefone.userId;
    const intencao = interpretarMensagem(texto);

    await mensagemWhatsappRepository.create({
      userId,
      numero,
      direcao: "ENTRADA",
      conteudo: texto,
      intencao: intencao.tipo,
      processadoComSucesso: intencao.tipo !== "DESCONHECIDO",
    });

    switch (intencao.tipo) {
      case "REGISTRAR_DESPESA": {
        const criadas = await despesaService.criar(userId, {
          descricao: intencao.descricao,
          valor: intencao.valor,
          data: new Date(),
          recorrente: false,
        });
        await mensagemWhatsappRepository.create({
          userId,
          numero,
          direcao: "SAIDA",
          conteudo: `Despesa registrada: ${formatarMoeda(intencao.valor)} em "${intencao.descricao}".`,
          intencao: intencao.tipo,
          processadoComSucesso: true,
          entidadeCriadaTipo: "Despesa",
          entidadeCriadaId: criadas[0].id,
        });
        await enviarResposta(numero, `Despesa registrada: ${formatarMoeda(intencao.valor)} em "${intencao.descricao}".`);
        return;
      }
      case "REGISTRAR_RECEITA": {
        const criadas = await receitaService.criar(userId, {
          descricao: intencao.descricao,
          valor: intencao.valor,
          data: new Date(),
          recorrente: false,
        });
        await mensagemWhatsappRepository.create({
          userId,
          numero,
          direcao: "SAIDA",
          conteudo: `Receita registrada: ${formatarMoeda(intencao.valor)} em "${intencao.descricao}".`,
          intencao: intencao.tipo,
          processadoComSucesso: true,
          entidadeCriadaTipo: "Receita",
          entidadeCriadaId: criadas[0].id,
        });
        await enviarResposta(numero, `Receita registrada: ${formatarMoeda(intencao.valor)} em "${intencao.descricao}".`);
        return;
      }
      case "CONSULTAR_SALDO": {
        const indicadores = await dashboardService.getIndicadores(userId);
        await enviarResposta(
          numero,
          `Saldo do mês: ${formatarMoeda(indicadores.saldoMes)} (receitas ${formatarMoeda(indicadores.receitasMes)}, despesas ${formatarMoeda(indicadores.despesasMes)}).`,
        );
        return;
      }
      case "AJUDA": {
        await enviarResposta(numero, MENSAGEM_AJUDA);
        return;
      }
      case "DESCONHECIDO": {
        await enviarResposta(numero, `Não entendi. ${MENSAGEM_AJUDA}`);
        return;
      }
    }
  },
};
