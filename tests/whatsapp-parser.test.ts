import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretarMensagem } from "@/services/whatsapp/mensagemParserService";

describe("interpretarMensagem", () => {
  it("reconhece despesa com valor inteiro", () => {
    const r = interpretarMensagem("gastei 50 no mercado");
    assert.deepEqual(r, { tipo: "REGISTRAR_DESPESA", valor: 50, descricao: "mercado" });
  });

  it("reconhece despesa com valor decimal e vírgula BR", () => {
    const r = interpretarMensagem("paguei 39,90 de assinatura netflix");
    assert.equal(r.tipo, "REGISTRAR_DESPESA");
    if (r.tipo === "REGISTRAR_DESPESA") {
      assert.equal(r.valor, 39.9);
      assert.equal(r.descricao, "assinatura netflix");
    }
  });

  it("reconhece receita", () => {
    const r = interpretarMensagem("recebi 1000 de salario");
    assert.equal(r.tipo, "REGISTRAR_RECEITA");
    if (r.tipo === "REGISTRAR_RECEITA") {
      assert.equal(r.valor, 1000);
      assert.equal(r.descricao, "salario");
    }
  });

  it("reconhece consulta de saldo", () => {
    assert.deepEqual(interpretarMensagem("qual meu saldo?"), { tipo: "CONSULTAR_SALDO" });
    assert.deepEqual(interpretarMensagem("saldo"), { tipo: "CONSULTAR_SALDO" });
  });

  it("reconhece pedido de ajuda", () => {
    assert.deepEqual(interpretarMensagem("ajuda"), { tipo: "AJUDA" });
    assert.deepEqual(interpretarMensagem("menu"), { tipo: "AJUDA" });
  });

  it("retorna desconhecido para despesa sem valor", () => {
    const r = interpretarMensagem("gastei no mercado");
    assert.equal(r.tipo, "DESCONHECIDO");
  });

  it("retorna desconhecido para mensagens sem intenção reconhecida", () => {
    const r = interpretarMensagem("oi tudo bem?");
    assert.equal(r.tipo, "DESCONHECIDO");
  });
});
