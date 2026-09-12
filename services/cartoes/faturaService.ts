import { z } from "zod";
import { faturaRepository } from "@/repositories/faturaRepository";
import { cartaoRepository } from "@/repositories/cartaoRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { faturaCicloService } from "@/services/cartoes/faturaCicloService";
import { serializarValor } from "@/lib/serialize";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const pagarFaturaSchema = z.object({
  valor: z.number().positive("Valor deve ser maior que zero."),
});

export type PagarFaturaDto = z.infer<typeof pagarFaturaSchema>;

const TOLERANCIA_CENTAVOS = 0.01;

export const faturaService = {
  async listarPorCartao(cartaoId: string, userId: string) {
    const cartao = await cartaoRepository.findById(cartaoId, userId);
    if (!cartao) throw new NotFoundError("Cartão não encontrado.");

    await faturaCicloService.fecharFaturasVencidas();

    const faturas = await faturaRepository.findAllForCartao(cartaoId);
    return Promise.all(
      faturas.map(async (fatura) => {
        const valorTotal =
          fatura.status === "ABERTA" ? await faturaRepository.somaCompras(fatura.id) : Number(fatura.valorTotal);
        return { ...fatura, valorTotal, valorPago: Number(fatura.valorPago) };
      }),
    );
  },

  async buscarComCompras(id: string, userId: string) {
    await faturaCicloService.fecharFaturasVencidas();

    const fatura = await faturaRepository.findByIdComCompras(id);
    if (!fatura || fatura.cartao.userId !== userId) {
      throw new NotFoundError("Fatura não encontrada.");
    }

    const valorTotal = fatura.status === "ABERTA" ? await faturaRepository.somaCompras(id) : Number(fatura.valorTotal);

    return {
      ...fatura,
      valorTotal,
      valorPago: Number(fatura.valorPago),
      compras: fatura.compras.map(serializarValor),
    };
  },

  async pagar(id: string, userId: string, input: PagarFaturaDto) {
    const dados = pagarFaturaSchema.parse(input);

    const fatura = await faturaRepository.findByIdComCompras(id);
    if (!fatura || fatura.cartao.userId !== userId) {
      throw new NotFoundError("Fatura não encontrada.");
    }
    if (fatura.status === "ABERTA") {
      throw new ValidationError("Esta fatura ainda não fechou.");
    }
    if (fatura.status === "PAGA") {
      throw new ValidationError("Esta fatura já está paga.");
    }

    const valorTotal = Number(fatura.valorTotal);
    const valorPago = Number(fatura.valorPago);
    const saldoDevedor = valorTotal - valorPago;

    if (dados.valor > saldoDevedor + TOLERANCIA_CENTAVOS) {
      throw new ValidationError(
        `Valor maior que o saldo devedor (${saldoDevedor.toFixed(2)}).`,
        "VALOR_ACIMA_DO_SALDO",
      );
    }

    const novoValorPago = valorPago + dados.valor;
    const novoStatus = novoValorPago >= valorTotal - TOLERANCIA_CENTAVOS ? "PAGA" : "PAGA_PARCIAL";

    const atualizada = await faturaRepository.registrarPagamento(id, novoValorPago, novoStatus);

    await auditLogRepository.create({
      userId,
      action: "PAGAMENTO",
      entity: "Fatura",
      entityId: id,
      metadata: { valor: dados.valor, novoStatus },
    });

    return { ...atualizada, valorTotal: Number(atualizada.valorTotal), valorPago: Number(atualizada.valorPago) };
  },
};
