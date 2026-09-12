import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcularSugestaoAporte, mesesRestantes } from "@/services/metas/sugestaoAporteService";

describe("mesesRestantes", () => {
  it("conta meses inteiros entre duas datas", () => {
    assert.equal(mesesRestantes(new Date(2026, 0, 1), new Date(2026, 5, 1)), 5);
  });

  it("nunca retorna menos que 1, mesmo com data-alvo no passado", () => {
    assert.equal(mesesRestantes(new Date(2026, 5, 1), new Date(2026, 0, 1)), 1);
  });
});

describe("calcularSugestaoAporte", () => {
  it("divide o valor faltante igualmente pelos meses restantes", () => {
    const sugestao = calcularSugestaoAporte(12000, 2000, new Date(2026, 9, 1), new Date(2026, 4, 1));

    assert.equal(sugestao.faltante, 10000);
    assert.equal(sugestao.mesesRestantes, 5);
    assert.equal(sugestao.aporteMensalSugerido, 2000);
  });

  it("não sugere valor negativo quando a meta já foi superada", () => {
    const sugestao = calcularSugestaoAporte(1000, 1500, new Date(2026, 9, 1), new Date(2026, 4, 1));

    assert.equal(sugestao.faltante, 0);
    assert.equal(sugestao.aporteMensalSugerido, 0);
  });
});
