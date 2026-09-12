import { faturaRepository } from "@/repositories/faturaRepository";
import { criarDataComDiaLimitado } from "@/services/financeiro/dateUtils";

export type Ciclo = {
  mesReferencia: number;
  anoReferencia: number;
  dataFechamento: Date;
  dataVencimento: Date;
};

/**
 * Determina a qual ciclo de fatura uma compra pertence, a partir do dia de
 * fechamento do cartão. Se a compra ocorre após o fechamento do mês, ela cai
 * na fatura que fecha no mês seguinte. `mesReferencia` é sempre o mês em que
 * a fatura fecha (1-12).
 */
export function determinarCiclo(dataCompra: Date, diaFechamento: number, diaVencimento: number): Ciclo {
  let mes = dataCompra.getMonth();
  let ano = dataCompra.getFullYear();

  if (dataCompra.getDate() > diaFechamento) {
    mes += 1;
    if (mes > 11) {
      mes = 0;
      ano += 1;
    }
  }

  const dataFechamento = criarDataComDiaLimitado(ano, mes, diaFechamento);

  let mesVencimento = mes;
  let anoVencimento = ano;
  if (diaVencimento <= diaFechamento) {
    mesVencimento += 1;
    if (mesVencimento > 11) {
      mesVencimento = 0;
      anoVencimento += 1;
    }
  }
  const dataVencimento = criarDataComDiaLimitado(anoVencimento, mesVencimento, diaVencimento);

  return { mesReferencia: mes + 1, anoReferencia: ano, dataFechamento, dataVencimento };
}

export const faturaCicloService = {
  determinarCiclo,

  async obterOuCriarFatura(cartaoId: string, dataCompra: Date, diaFechamento: number, diaVencimento: number) {
    const ciclo = determinarCiclo(dataCompra, diaFechamento, diaVencimento);
    const existente = await faturaRepository.findByCartaoECiclo(cartaoId, ciclo.mesReferencia, ciclo.anoReferencia);
    if (existente) return existente;

    return faturaRepository.create({
      cartaoId,
      mesReferencia: ciclo.mesReferencia,
      anoReferencia: ciclo.anoReferencia,
      dataFechamento: ciclo.dataFechamento,
      dataVencimento: ciclo.dataVencimento,
    });
  },

  /** Fecha automaticamente toda fatura ABERTA cuja data de fechamento já passou. */
  async fecharFaturasVencidas(): Promise<void> {
    const vencidas = await faturaRepository.listarAbertasVencidas(new Date());
    for (const fatura of vencidas) {
      const total = await faturaRepository.somaCompras(fatura.id);
      await faturaRepository.fecharComTotal(fatura.id, total);
    }
  },
};
