import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calcularTabelaPrice,
  calcularTabelaSac,
  compararSistemasAmortizacao,
  resumirTabela,
} from "@/services/financiamentos/amortizacaoService";

describe("calcularTabelaSac", () => {
  it("mantém amortização constante e zera o saldo devedor", () => {
    const tabela = calcularTabelaSac(1200, 2, 12);

    assert.equal(tabela.length, 12);
    assert.equal(tabela[0].amortizacao, 100);
    assert.equal(tabela[0].juros, 24);
    assert.equal(tabela[0].valorParcela, 124);
    assert.equal(tabela[tabela.length - 1].saldoDevedor, 0);

    for (const parcela of tabela) {
      assert.equal(parcela.amortizacao, 100);
    }
  });
});

describe("calcularTabelaPrice", () => {
  it("mantém a parcela praticamente constante e zera o saldo devedor", () => {
    const tabela = calcularTabelaPrice(1200, 2, 12);

    assert.equal(tabela.length, 12);
    assert.equal(tabela[tabela.length - 1].saldoDevedor, 0);

    const somaAmortizacao = tabela.reduce((soma, p) => soma + p.amortizacao, 0);
    assert.ok(Math.abs(somaAmortizacao - 1200) < 0.05);

    const parcelas = tabela.slice(0, -1).map((p) => p.valorParcela);
    for (const valor of parcelas) {
      assert.ok(Math.abs(valor - parcelas[0]) < 0.01);
    }
  });

  it("com taxa zero, equivale à divisão simples (igual ao SAC)", () => {
    const price = calcularTabelaPrice(1000, 0, 10);
    const sac = calcularTabelaSac(1000, 0, 10);

    assert.equal(price[0].valorParcela, 100);
    assert.deepEqual(
      price.map((p) => p.valorParcela),
      sac.map((p) => p.valorParcela),
    );
  });
});

describe("compararSistemasAmortizacao", () => {
  it("SAC paga menos juros totais que Price para o mesmo financiamento", () => {
    const comparacao = compararSistemasAmortizacao(50000, 1.5, 60);

    assert.ok(comparacao.sac.totalJuros < comparacao.price.totalJuros);
    assert.ok(comparacao.sac.primeiraParcela > comparacao.price.primeiraParcela);
    assert.ok(comparacao.sac.ultimaParcela < comparacao.price.ultimaParcela);
  });
});

describe("resumirTabela", () => {
  it("soma parcelas e juros corretamente", () => {
    const tabela = calcularTabelaSac(300, 0, 3);
    const resumo = resumirTabela(tabela);

    assert.equal(resumo.totalPago, 300);
    assert.equal(resumo.totalJuros, 0);
    assert.equal(resumo.primeiraParcela, 100);
    assert.equal(resumo.ultimaParcela, 100);
  });
});

describe("simularQuitacaoAntecipada", () => {
  it("calcula a economia entre quitar hoje e seguir pagando", async () => {
    const { simularQuitacaoAntecipada } = await import("@/services/dividas/simulacaoQuitacaoService");
    const simulacao = simularQuitacaoAntecipada(4000, 6, 750);

    assert.equal(simulacao.valorQuitacaoHoje, 4000);
    assert.equal(simulacao.totalSeContinuar, 4500);
    assert.equal(simulacao.economiaEstimada, 500);
  });
});
