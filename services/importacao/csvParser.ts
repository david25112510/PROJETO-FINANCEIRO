import { ValidationError } from "@/lib/errors";
import type { TransacaoImportada } from "@/services/importacao/types";

const DIACRITICOS = /[̀-ͯ]/g;

function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize("NFD").replace(DIACRITICOS, "");
}

function parseDataCsv(texto: string): Date | null {
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, ano, mes, dia] = iso;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return Number.isNaN(data.getTime()) ? null : data;
  }
  const br = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) {
    const [, dia, mes, ano] = br;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    return Number.isNaN(data.getTime()) ? null : data;
  }
  return null;
}

function parseValorCsv(texto: string): number | null {
  let normalizado = texto.replace(/[R$\s]/gi, "");
  if (/,\d{1,2}$/.test(normalizado)) {
    normalizado = normalizado.replace(/\./g, "").replace(",", ".");
  } else {
    normalizado = normalizado.replace(/,/g, "");
  }
  const valor = Number(normalizado);
  return Number.isNaN(valor) ? null : valor;
}

/**
 * Extrai transações de um CSV de extrato. Formato esperado (flexível a
 * maiúsculas/acentos): colunas `data`, `descricao`, `valor` e opcionalmente
 * `tipo` (RECEITA/DESPESA — se ausente, o sinal do valor decide). Aceita
 * separador `,` ou `;` e valores em formato BR (1.234,56) ou US (1234.56).
 */
export function parseCsv(conteudo: string): TransacaoImportada[] {
  const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length < 2) return [];

  const delimitador = linhas[0].includes(";") ? ";" : ",";
  const cabecalho = linhas[0].split(delimitador).map(normalizar);

  const indiceData = cabecalho.indexOf("data");
  const indiceDescricao = cabecalho.findIndex((c) => c === "descricao" || c === "historico");
  const indiceValor = cabecalho.indexOf("valor");
  const indiceTipo = cabecalho.indexOf("tipo");

  if (indiceData === -1 || indiceDescricao === -1 || indiceValor === -1) {
    throw new ValidationError(
      "O CSV precisa ter as colunas 'data', 'descricao' e 'valor' (coluna 'tipo' é opcional).",
      "CSV_COLUNAS_INVALIDAS",
    );
  }

  const transacoes: TransacaoImportada[] = [];
  for (const linha of linhas.slice(1)) {
    const colunas = linha.split(delimitador);
    const dataTexto = colunas[indiceData]?.trim();
    const descricaoTexto = colunas[indiceDescricao]?.trim();
    const valorTexto = colunas[indiceValor]?.trim();
    if (!dataTexto || !descricaoTexto || !valorTexto) continue;

    const data = parseDataCsv(dataTexto);
    const valorNumerico = parseValorCsv(valorTexto);
    if (!data || valorNumerico === null || valorNumerico === 0) continue;

    let tipo: "RECEITA" | "DESPESA";
    if (indiceTipo !== -1) {
      tipo = normalizar(colunas[indiceTipo] ?? "") === "receita" ? "RECEITA" : "DESPESA";
    } else {
      tipo = valorNumerico >= 0 ? "RECEITA" : "DESPESA";
    }

    transacoes.push({ data, descricao: descricaoTexto, valor: Math.abs(valorNumerico), tipo });
  }

  return transacoes;
}
