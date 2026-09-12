export type SimulacaoQuitacao = {
  valorQuitacaoHoje: number;
  totalSeContinuar: number;
  economiaEstimada: number;
  parcelasRestantes: number;
};

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Compara quitar a dívida hoje (pelo saldo devedor atual) contra seguir
 * pagando as parcelas restantes. A diferença é a economia de juros futuros
 * evitados ao antecipar a quitação.
 */
export function simularQuitacaoAntecipada(
  valorAtual: number,
  parcelasRestantes: number,
  valorParcela: number,
): SimulacaoQuitacao {
  const totalSeContinuar = parcelasRestantes * valorParcela;
  const economiaEstimada = totalSeContinuar - valorAtual;

  return {
    valorQuitacaoHoje: arredondar(valorAtual),
    totalSeContinuar: arredondar(totalSeContinuar),
    economiaEstimada: arredondar(economiaEstimada),
    parcelasRestantes,
  };
}
