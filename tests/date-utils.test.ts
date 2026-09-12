import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adicionarMesesPreservandoDia, criarDataComDiaLimitado } from "@/services/financeiro/dateUtils";
import { dividirEmParcelas } from "@/services/financeiro/parcelamentoService";

describe("dateUtils", () => {
  it("limita dias inexistentes ao último dia do mês", () => {
    const data = criarDataComDiaLimitado(2025, 1, 31);

    assert.equal(data.getFullYear(), 2025);
    assert.equal(data.getMonth(), 1);
    assert.equal(data.getDate(), 28);
  });

  it("preserva o dia original ao somar meses quando possível", () => {
    const fevereiro = adicionarMesesPreservandoDia(new Date(2024, 0, 31), 1);
    const marco = adicionarMesesPreservandoDia(new Date(2024, 0, 31), 2);

    assert.equal(fevereiro.getDate(), 29);
    assert.equal(marco.getDate(), 31);
  });
});

describe("dividirEmParcelas", () => {
  it("mantém a soma exata em centavos e datas mensais válidas", () => {
    const parcelas = dividirEmParcelas(100, 3, new Date(2025, 0, 31));

    assert.equal(parcelas.length, 3);
    assert.equal(parcelas.reduce((total, parcela) => total + Math.round(parcela.valor * 100), 0), 10000);
    assert.deepEqual(
      parcelas.map((parcela) => parcela.data.getDate()),
      [31, 28, 31],
    );
  });
});
