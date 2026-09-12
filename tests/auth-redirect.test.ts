import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizarDestinoInterno } from "@/lib/internalRedirect";

describe("normalizarDestinoInterno", () => {
  it("preserva caminhos internos", () => {
    assert.equal(normalizarDestinoInterno("/relatorios?periodo=mes"), "/relatorios?periodo=mes");
  });

  it("rejeita destinos externos e caminhos ambíguos", () => {
    assert.equal(normalizarDestinoInterno("https://exemplo.com"), "/dashboard");
    assert.equal(normalizarDestinoInterno("//exemplo.com"), "/dashboard");
    assert.equal(normalizarDestinoInterno("/\\exemplo.com"), "/dashboard");
    assert.equal(normalizarDestinoInterno(null), "/dashboard");
  });
});
