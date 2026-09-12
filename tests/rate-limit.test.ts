import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimiter } from "@/lib/rateLimit";

describe("rateLimiter", () => {
  it("permite até o limite e bloqueia a partir daí, dentro da janela", () => {
    const chave = `teste-${Math.random()}`;

    for (let i = 0; i < 3; i++) {
      const resultado = rateLimiter.tentar(chave, 3, 60_000);
      assert.equal(resultado.permitido, true);
    }

    const excedente = rateLimiter.tentar(chave, 3, 60_000);
    assert.equal(excedente.permitido, false);
    assert.equal(excedente.restantes, 0);
  });

  it("chaves diferentes não interferem entre si", () => {
    const chaveA = `a-${Math.random()}`;
    const chaveB = `b-${Math.random()}`;

    rateLimiter.tentar(chaveA, 1, 60_000);
    const resultadoB = rateLimiter.tentar(chaveB, 1, 60_000);

    assert.equal(resultadoB.permitido, true);
  });

  it("reiniciar() libera a chave imediatamente", () => {
    const chave = `reset-${Math.random()}`;
    rateLimiter.tentar(chave, 1, 60_000);
    assert.equal(rateLimiter.tentar(chave, 1, 60_000).permitido, false);

    rateLimiter.reiniciar(chave);
    assert.equal(rateLimiter.tentar(chave, 1, 60_000).permitido, true);
  });
});
