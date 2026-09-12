import type { TransacaoImportada } from "@/services/importacao/types";

function parseDataOfx(bruto: string): Date | null {
  const match = bruto.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, ano, mes, dia] = match;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Extrai transações de um arquivo OFX (extrato bancário). OFX 1.x é SGML
 * (tags de folha nem sempre fecham), então a extração é feita por regex em
 * vez de um parser XML estrito — abordagem padrão para esse formato.
 */
export function parseOfx(conteudo: string): TransacaoImportada[] {
  const blocos = conteudo.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];
  const transacoes: TransacaoImportada[] = [];

  for (const bloco of blocos) {
    const dtPosted = bloco.match(/<DTPOSTED>\s*([^\s<\r\n]+)/i)?.[1];
    const trnAmt = bloco.match(/<TRNAMT>\s*([^\s<\r\n]+)/i)?.[1];
    const memo = bloco.match(/<MEMO>\s*([^\r\n<]+)/i)?.[1];
    const name = bloco.match(/<NAME>\s*([^\r\n<]+)/i)?.[1];

    if (!dtPosted || !trnAmt) continue;

    const data = parseDataOfx(dtPosted);
    if (!data) continue;

    const valorNumerico = Number(trnAmt.replace(",", "."));
    if (Number.isNaN(valorNumerico) || valorNumerico === 0) continue;

    const descricao = (memo ?? name ?? "Transação importada").trim();

    transacoes.push({
      data,
      descricao,
      valor: Math.abs(valorNumerico),
      tipo: valorNumerico >= 0 ? "RECEITA" : "DESPESA",
    });
  }

  return transacoes;
}
