function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Quantidade de meses inteiros entre hoje e a data-alvo, nunca menor que 1. */
export function mesesRestantes(hoje: Date, dataAlvo: Date): number {
  const meses = (dataAlvo.getFullYear() - hoje.getFullYear()) * 12 + (dataAlvo.getMonth() - hoje.getMonth());
  return Math.max(1, meses);
}

export type SugestaoAporte = {
  faltante: number;
  mesesRestantes: number;
  aporteMensalSugerido: number;
};

/**
 * Sugere o aporte mensal necessário para atingir a meta até a data-alvo,
 * dividindo o valor faltante igualmente pelos meses restantes.
 */
export function calcularSugestaoAporte(
  valorAlvo: number,
  valorAtual: number,
  dataAlvo: Date,
  hoje: Date = new Date(),
): SugestaoAporte {
  const faltante = Math.max(0, valorAlvo - valorAtual);
  const meses = mesesRestantes(hoje, dataAlvo);

  return {
    faltante: arredondar(faltante),
    mesesRestantes: meses,
    aporteMensalSugerido: arredondar(faltante / meses),
  };
}
