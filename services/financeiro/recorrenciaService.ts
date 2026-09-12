import type { FrequenciaRecorrencia } from "@prisma/client";
import { adicionarMesesPreservandoDia } from "@/services/financeiro/dateUtils";

/** Quantas ocorrências futuras materializar ao criar um lançamento recorrente. */
export const HORIZONTE_OCORRENCIAS_RECORRENCIA = 12;

const MESES_POR_FREQUENCIA: Record<FrequenciaRecorrencia, number> = {
  SEMANAL: 0, // tratado à parte (dias, não meses)
  MENSAL: 1,
  BIMESTRAL: 2,
  TRIMESTRAL: 3,
  SEMESTRAL: 6,
  ANUAL: 12,
};

function proximaData(data: Date, frequencia: FrequenciaRecorrencia): Date {
  if (frequencia === "SEMANAL") {
    const proxima = new Date(data);
    proxima.setDate(proxima.getDate() + 7);
    return proxima;
  }
  return adicionarMesesPreservandoDia(data, MESES_POR_FREQUENCIA[frequencia]);
}

/**
 * Gera as datas das ocorrências de um lançamento recorrente, a partir da data inicial.
 * A primeira data retornada é a própria `dataInicial`.
 */
export function gerarDatasRecorrencia(
  dataInicial: Date,
  frequencia: FrequenciaRecorrencia,
  quantidadeOcorrencias: number = HORIZONTE_OCORRENCIAS_RECORRENCIA,
): Date[] {
  const datas: Date[] = [dataInicial];
  let atual = dataInicial;
  for (let i = 1; i < quantidadeOcorrencias; i++) {
    atual = proximaData(atual, frequencia);
    datas.push(atual);
  }
  return datas;
}
