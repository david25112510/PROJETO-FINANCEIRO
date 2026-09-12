import { adicionarMesesPreservandoDia } from "@/services/financeiro/dateUtils";

export type Parcela = {
  parcelaAtual: number;
  totalParcelas: number;
  valor: number;
  data: Date;
};

/**
 * Divide um valor total em N parcelas mensais iguais, a partir da data inicial.
 * A última parcela absorve o resíduo de arredondamento (em centavos) para que a
 * soma das parcelas bata exatamente com o valor total.
 */
export function dividirEmParcelas(valorTotal: number, totalParcelas: number, dataInicial: Date): Parcela[] {
  const valorParcelaCentavos = Math.floor((valorTotal * 100) / totalParcelas);
  const totalDistribuidoCentavos = valorParcelaCentavos * totalParcelas;
  const residuoCentavos = Math.round(valorTotal * 100) - totalDistribuidoCentavos;

  const parcelas: Parcela[] = [];
  for (let i = 0; i < totalParcelas; i++) {
    const data = adicionarMesesPreservandoDia(dataInicial, i);

    const ehUltimaParcela = i === totalParcelas - 1;
    const valorCentavos = valorParcelaCentavos + (ehUltimaParcela ? residuoCentavos : 0);

    parcelas.push({
      parcelaAtual: i + 1,
      totalParcelas,
      valor: valorCentavos / 100,
      data,
    });
  }
  return parcelas;
}
