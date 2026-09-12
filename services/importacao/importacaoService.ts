import { receitaRepository } from "@/repositories/receitaRepository";
import { despesaRepository } from "@/repositories/despesaRepository";
import { importacaoRepository } from "@/repositories/importacaoRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { categorizacaoService } from "@/services/inteligencia/categorizacaoService";
import { cache } from "@/lib/cache";
import { ValidationError } from "@/lib/errors";
import { parseOfx } from "@/services/importacao/ofxParser";
import { parseCsv } from "@/services/importacao/csvParser";
import type { TransacaoImportada } from "@/services/importacao/types";

export type RelatorioImportacao = {
  id: string;
  totalLidos: number;
  totalImportados: number;
  totalDuplicados: number;
  totalErros: number;
};

const TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024; // 2MB
const LIMITE_TRANSACOES = 2000;

function assinatura(t: { data: Date; valor: number; descricao: string }): string {
  return `${t.data.toISOString().slice(0, 10)}|${t.valor.toFixed(2)}|${t.descricao.trim().toLowerCase()}`;
}

function detectarFormato(nomeArquivo: string, conteudo: string): "OFX" | "CSV" {
  const extensao = nomeArquivo.split(".").pop()?.toLowerCase();
  if (extensao === "ofx") return "OFX";
  if (extensao === "csv") return "CSV";
  if (/<ofx>/i.test(conteudo) || conteudo.includes("OFXHEADER")) return "OFX";
  return "CSV";
}

function invalidarCacheDashboard(userId: string) {
  cache.invalidatePrefix(`dashboard:${userId}`);
}

export const importacaoService = {
  async importar(userId: string, nomeArquivo: string, conteudo: string): Promise<RelatorioImportacao> {
    if (conteudo.length > TAMANHO_MAXIMO_BYTES) {
      throw new ValidationError("Arquivo muito grande (máximo 2MB).", "ARQUIVO_MUITO_GRANDE");
    }

    const formato = detectarFormato(nomeArquivo, conteudo);
    const transacoes = formato === "OFX" ? parseOfx(conteudo) : parseCsv(conteudo);
    const totalLidos = transacoes.length;

    if (totalLidos === 0) {
      throw new ValidationError(
        "Nenhuma transação reconhecida no arquivo. Verifique o formato.",
        "NENHUMA_TRANSACAO_ENCONTRADA",
      );
    }
    if (totalLidos > LIMITE_TRANSACOES) {
      throw new ValidationError(`Arquivo tem mais de ${LIMITE_TRANSACOES} transações.`, "ARQUIVO_COM_MUITAS_LINHAS");
    }

    const datas = transacoes.map((t) => t.data.getTime());
    const dataInicio = new Date(Math.min(...datas));
    const dataFim = new Date(Math.max(...datas));

    const [receitasExistentes, despesasExistentes] = await Promise.all([
      receitaRepository.listarParaDeduplicacao(userId, dataInicio, dataFim),
      despesaRepository.listarParaDeduplicacao(userId, dataInicio, dataFim),
    ]);
    const assinaturasExistentes = new Set([...receitasExistentes, ...despesasExistentes].map(assinatura));

    const novasReceitas: TransacaoImportada[] = [];
    const novasDespesas: TransacaoImportada[] = [];
    const assinaturasNoArquivo = new Set<string>();
    let totalDuplicados = 0;

    for (const transacao of transacoes) {
      const chave = assinatura(transacao);
      if (assinaturasExistentes.has(chave) || assinaturasNoArquivo.has(chave)) {
        totalDuplicados += 1;
        continue;
      }
      assinaturasNoArquivo.add(chave);
      (transacao.tipo === "RECEITA" ? novasReceitas : novasDespesas).push(transacao);
    }

    const [receitasCriadas, despesasCriadas] = await Promise.all([
      novasReceitas.length > 0
        ? receitaRepository.createMany(
            await Promise.all(
              novasReceitas.map(async (t) => ({
                userId,
                descricao: t.descricao,
                valor: t.valor,
                data: t.data,
                categoriaId: (await categorizacaoService.sugerir(userId, t.descricao, "RECEITA"))?.categoriaId ?? null,
              })),
            ),
          )
        : Promise.resolve([]),
      novasDespesas.length > 0
        ? despesaRepository.createMany(
            await Promise.all(
              novasDespesas.map(async (t) => ({
                userId,
                descricao: t.descricao,
                valor: t.valor,
                data: t.data,
                categoriaId: (await categorizacaoService.sugerir(userId, t.descricao, "DESPESA"))?.categoriaId ?? null,
              })),
            ),
          )
        : Promise.resolve([]),
    ]);

    const totalImportados = receitasCriadas.length + despesasCriadas.length;

    const registro = await importacaoRepository.create({
      userId,
      nomeArquivo,
      tipoArquivo: formato,
      totalLidos,
      totalImportados,
      totalDuplicados,
      totalErros: 0,
    });

    await auditLogRepository.create({
      userId,
      action: "IMPORTACAO",
      entity: "ImportacaoArquivo",
      entityId: registro.id,
      metadata: { nomeArquivo, formato, totalLidos, totalImportados, totalDuplicados },
    });

    if (totalImportados > 0) {
      invalidarCacheDashboard(userId);
    }

    return {
      id: registro.id,
      totalLidos,
      totalImportados,
      totalDuplicados,
      totalErros: 0,
    };
  },

  async historico(userId: string) {
    return importacaoRepository.findAllForUser(userId);
  },
};
