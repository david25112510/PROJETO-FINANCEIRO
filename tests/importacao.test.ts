import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseOfx } from "@/services/importacao/ofxParser";
import { parseCsv } from "@/services/importacao/csvParser";

const OFX_EXEMPLO = `OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260805120000[-3:GMT]
<TRNAMT>-45.90
<FITID>202608050001
<MEMO>PADARIA DO BAIRRO
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260810000000
<TRNAMT>5500.00
<FITID>202608100001
<MEMO>SALARIO
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

describe("parseOfx", () => {
  it("extrai transações com data, valor e tipo corretos", () => {
    const transacoes = parseOfx(OFX_EXEMPLO);

    assert.equal(transacoes.length, 2);

    assert.equal(transacoes[0].descricao, "PADARIA DO BAIRRO");
    assert.equal(transacoes[0].valor, 45.9);
    assert.equal(transacoes[0].tipo, "DESPESA");
    assert.equal(transacoes[0].data.getFullYear(), 2026);
    assert.equal(transacoes[0].data.getMonth(), 7);
    assert.equal(transacoes[0].data.getDate(), 5);

    assert.equal(transacoes[1].descricao, "SALARIO");
    assert.equal(transacoes[1].valor, 5500);
    assert.equal(transacoes[1].tipo, "RECEITA");
  });

  it("ignora arquivo sem transações reconhecíveis", () => {
    assert.deepEqual(parseOfx("conteúdo qualquer sem tags OFX"), []);
  });
});

describe("parseCsv", () => {
  it("interpreta CSV com vírgula, formato BR de valor e data DD/MM/AAAA", () => {
    const csv = ["data;descricao;valor;tipo", "05/08/2026;Padaria do bairro;-45,90;DESPESA", "10/08/2026;Salario;5.500,00;RECEITA"].join(
      "\n",
    );

    const transacoes = parseCsv(csv);
    assert.equal(transacoes.length, 2);
    assert.equal(transacoes[0].valor, 45.9);
    assert.equal(transacoes[0].tipo, "DESPESA");
    assert.equal(transacoes[1].valor, 5500);
    assert.equal(transacoes[1].tipo, "RECEITA");
  });

  it("infere tipo pelo sinal do valor quando a coluna tipo está ausente", () => {
    const csv = ["data,descricao,valor", "2026-08-01,Mercado,-120.50"].join("\n");
    const transacoes = parseCsv(csv);
    assert.equal(transacoes[0].tipo, "DESPESA");
    assert.equal(transacoes[0].valor, 120.5);
  });

  it("rejeita CSV sem as colunas obrigatórias", () => {
    assert.throws(() => parseCsv("coluna1,coluna2\nabc,def"));
  });

  it("retorna vazio para arquivo com só o cabeçalho", () => {
    assert.deepEqual(parseCsv("data,descricao,valor"), []);
  });
});
