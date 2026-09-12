import { randomUUID } from "crypto";
import { z } from "zod";
import { compraRepository } from "@/repositories/compraRepository";
import { cartaoRepository } from "@/repositories/cartaoRepository";
import { categoriaRepository } from "@/repositories/categoriaRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { faturaCicloService } from "@/services/cartoes/faturaCicloService";
import { dividirEmParcelas } from "@/services/financeiro/parcelamentoService";
import { serializarValor } from "@/lib/serialize";
import { cache } from "@/lib/cache";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const criarCompraSchema = z.object({
  cartaoId: z.string().min(1),
  categoriaId: z.string().min(1).nullable().optional(),
  descricao: z.string().trim().min(2, "Descrição deve ter ao menos 2 caracteres.").max(120),
  valor: z.number().positive("Valor deve ser maior que zero."),
  data: z.coerce.date(),
  observacoes: z.string().trim().max(500).optional(),
  totalParcelas: z.number().int().min(2).max(60).optional(),
});

export type CriarCompraDto = z.infer<typeof criarCompraSchema>;

function invalidarCacheDashboard(userId: string) {
  cache.invalidatePrefix(`dashboard:${userId}`);
}

export const compraService = {
  async criar(userId: string, input: CriarCompraDto) {
    const dados = criarCompraSchema.parse(input);

    const cartao = await cartaoRepository.findById(dados.cartaoId, userId);
    if (!cartao) throw new NotFoundError("Cartão não encontrado.");
    if (!cartao.ativo) throw new ValidationError("Este cartão está inativo.");

    if (dados.categoriaId) {
      const categoria = await categoriaRepository.findById(dados.categoriaId, userId);
      if (!categoria) throw new ValidationError("Categoria inválida.");
      if (categoria.tipo !== "DESPESA") {
        throw new ValidationError("A categoria selecionada é de receita, não de despesa.");
      }
    }

    let criadas;

    if (dados.totalParcelas && dados.totalParcelas > 1) {
      const grupoParcelamentoId = randomUUID();
      const parcelas = dividirEmParcelas(dados.valor, dados.totalParcelas, dados.data);

      criadas = await compraRepository.createMany(
        await Promise.all(
          parcelas.map(async (parcela) => {
            const fatura = await faturaCicloService.obterOuCriarFatura(
              cartao.id,
              parcela.data,
              cartao.diaFechamento,
              cartao.diaVencimento,
            );
            return {
              userId,
              cartaoId: cartao.id,
              faturaId: fatura.id,
              categoriaId: dados.categoriaId ?? null,
              descricao: dados.descricao,
              valor: parcela.valor,
              data: parcela.data,
              parcelaAtual: parcela.parcelaAtual,
              totalParcelas: parcela.totalParcelas,
              grupoParcelamentoId,
              observacoes: dados.observacoes ?? null,
            };
          }),
        ),
      );
    } else {
      const fatura = await faturaCicloService.obterOuCriarFatura(
        cartao.id,
        dados.data,
        cartao.diaFechamento,
        cartao.diaVencimento,
      );
      criadas = [
        await compraRepository.create({
          userId,
          cartaoId: cartao.id,
          faturaId: fatura.id,
          categoriaId: dados.categoriaId ?? null,
          descricao: dados.descricao,
          valor: dados.valor,
          data: dados.data,
          observacoes: dados.observacoes ?? null,
        }),
      ];
    }

    await auditLogRepository.create({
      userId,
      action: "CREATE",
      entity: "Compra",
      entityId: criadas[0].id,
      metadata: { cartaoId: cartao.id, quantidadeLancamentos: criadas.length },
    });

    invalidarCacheDashboard(userId);
    return criadas.map(serializarValor);
  },

  async excluir(id: string, userId: string) {
    const compra = await compraRepository.findById(id, userId);
    if (!compra) throw new NotFoundError("Compra não encontrada.");

    await compraRepository.delete(id, userId);
    await auditLogRepository.create({ userId, action: "DELETE", entity: "Compra", entityId: id });
    invalidarCacheDashboard(userId);
  },
};
