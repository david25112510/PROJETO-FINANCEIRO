import type { SistemaAmortizacao } from "@prisma/client";

export type ParcelaAmortizacao = {
  numero: number;
  valorParcela: number;
  juros: number;
  amortizacao: number;
  saldoDevedor: number;
};

export type ResumoAmortizacao = {
  totalPago: number;
  totalJuros: number;
  primeiraParcela: number;
  ultimaParcela: number;
};

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Tabela Price (parcelas fixas): PMT = PV·i / (1 − (1+i)^−n).
 * A última parcela quita exatamente o saldo remanescente, absorvendo o
 * resíduo de arredondamento acumulado nas parcelas anteriores.
 */
export function calcularTabelaPrice(
  valorTotal: number,
  taxaJurosMensal: number,
  numeroParcelas: number,
): ParcelaAmortizacao[] {
  const i = taxaJurosMensal / 100;
  const pmt = i === 0 ? valorTotal / numeroParcelas : (valorTotal * i) / (1 - Math.pow(1 + i, -numeroParcelas));

  let saldo = valorTotal;
  const tabela: ParcelaAmortizacao[] = [];

  for (let numero = 1; numero <= numeroParcelas; numero++) {
    const juros = saldo * i;
    const ehUltima = numero === numeroParcelas;
    const amortizacao = ehUltima ? saldo : pmt - juros;
    const valorParcela = ehUltima ? amortizacao + juros : pmt;
    saldo = Math.max(0, saldo - amortizacao);

    tabela.push({
      numero,
      valorParcela: arredondar(valorParcela),
      juros: arredondar(juros),
      amortizacao: arredondar(amortizacao),
      saldoDevedor: arredondar(saldo),
    });
  }

  return tabela;
}

/** Sistema de Amortização Constante: amortização fixa, parcela decrescente. */
export function calcularTabelaSac(
  valorTotal: number,
  taxaJurosMensal: number,
  numeroParcelas: number,
): ParcelaAmortizacao[] {
  const i = taxaJurosMensal / 100;
  const amortizacaoConstante = valorTotal / numeroParcelas;

  let saldo = valorTotal;
  const tabela: ParcelaAmortizacao[] = [];

  for (let numero = 1; numero <= numeroParcelas; numero++) {
    const juros = saldo * i;
    const valorParcela = amortizacaoConstante + juros;
    saldo = Math.max(0, saldo - amortizacaoConstante);

    tabela.push({
      numero,
      valorParcela: arredondar(valorParcela),
      juros: arredondar(juros),
      amortizacao: arredondar(amortizacaoConstante),
      saldoDevedor: arredondar(saldo),
    });
  }

  return tabela;
}

export function calcularTabelaAmortizacao(
  sistema: SistemaAmortizacao,
  valorTotal: number,
  taxaJurosMensal: number,
  numeroParcelas: number,
): ParcelaAmortizacao[] {
  return sistema === "PRICE"
    ? calcularTabelaPrice(valorTotal, taxaJurosMensal, numeroParcelas)
    : calcularTabelaSac(valorTotal, taxaJurosMensal, numeroParcelas);
}

export function resumirTabela(tabela: ParcelaAmortizacao[]): ResumoAmortizacao {
  const totalPago = tabela.reduce((soma, parcela) => soma + parcela.valorParcela, 0);
  const totalJuros = tabela.reduce((soma, parcela) => soma + parcela.juros, 0);

  return {
    totalPago: arredondar(totalPago),
    totalJuros: arredondar(totalJuros),
    primeiraParcela: tabela[0]?.valorParcela ?? 0,
    ultimaParcela: tabela[tabela.length - 1]?.valorParcela ?? 0,
  };
}

/** Compara os dois sistemas de amortização lado a lado, para o comparador de cenários. */
export function compararSistemasAmortizacao(valorTotal: number, taxaJurosMensal: number, numeroParcelas: number) {
  const price = calcularTabelaPrice(valorTotal, taxaJurosMensal, numeroParcelas);
  const sac = calcularTabelaSac(valorTotal, taxaJurosMensal, numeroParcelas);

  return {
    price: resumirTabela(price),
    sac: resumirTabela(sac),
  };
}
