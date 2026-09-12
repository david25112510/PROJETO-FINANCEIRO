import PDFDocument from "pdfkit";
import type { RelatorioResultado } from "@/services/relatorios/relatorioService";
import { formatarData, formatarMoeda } from "@/lib/format";

function formatarVariacaoTexto(variacao: number | null): string {
  if (variacao === null) return "";
  const sinal = variacao > 0 ? "+" : "";
  return ` (${sinal}${variacao.toFixed(1)}% vs. período anterior)`;
}

export function gerarPdfRelatorio(relatorio: RelatorioResultado): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).fillColor("#101828").text("FinanceOps — Relatório Financeiro");
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor("#626c78")
      .text(`Período: ${formatarData(relatorio.periodo.dataInicio)} a ${formatarData(relatorio.periodo.dataFim)}`);
    doc.moveDown();

    doc.fillColor("#101828").fontSize(13).text("Resumo do período");
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text(`Receitas: ${formatarMoeda(relatorio.periodo.totalReceitas)}`);
    doc.text(`Despesas: ${formatarMoeda(relatorio.periodo.totalDespesas)}`);
    doc.text(`Saldo: ${formatarMoeda(relatorio.periodo.saldo)}`);
    doc.moveDown();

    if (relatorio.comparacao) {
      doc.fontSize(13).text("Comparativo com o período anterior");
      doc.moveDown(0.3);
      doc.fontSize(10);
      doc.text(
        `Período anterior: ${formatarData(relatorio.comparacao.dataInicio)} a ${formatarData(relatorio.comparacao.dataFim)}`,
      );
      doc.text(
        `Receitas: ${formatarMoeda(relatorio.comparacao.totalReceitas)}${formatarVariacaoTexto(relatorio.comparacao.variacaoReceitas)}`,
      );
      doc.text(
        `Despesas: ${formatarMoeda(relatorio.comparacao.totalDespesas)}${formatarVariacaoTexto(relatorio.comparacao.variacaoDespesas)}`,
      );
      doc.text(
        `Saldo: ${formatarMoeda(relatorio.comparacao.saldo)}${formatarVariacaoTexto(relatorio.comparacao.variacaoSaldo)}`,
      );
      doc.moveDown();
    }

    doc.fontSize(13).text("Receitas por categoria");
    doc.moveDown(0.3);
    doc.fontSize(10);
    if (relatorio.receitasPorCategoria.length === 0) {
      doc.fillColor("#8b95a1").text("Nenhuma receita no período.").fillColor("#101828");
    } else {
      for (const item of relatorio.receitasPorCategoria) {
        doc.text(`${item.nome}: ${formatarMoeda(item.total)}`);
      }
    }
    doc.moveDown();

    doc.fontSize(13).text("Despesas por categoria");
    doc.moveDown(0.3);
    doc.fontSize(10);
    if (relatorio.despesasPorCategoria.length === 0) {
      doc.fillColor("#8b95a1").text("Nenhuma despesa no período.").fillColor("#101828");
    } else {
      for (const item of relatorio.despesasPorCategoria) {
        doc.text(`${item.nome}: ${formatarMoeda(item.total)}`);
      }
    }

    if (relatorio.serieMensal.length > 1) {
      doc.moveDown();
      doc.fontSize(13).text("Série mensal");
      doc.moveDown(0.3);
      doc.fontSize(10);
      for (const ponto of relatorio.serieMensal) {
        doc.text(
          `${String(ponto.mes).padStart(2, "0")}/${ponto.ano} — Receitas ${formatarMoeda(ponto.receitas)} · Despesas ${formatarMoeda(
            ponto.despesas,
          )} · Saldo ${formatarMoeda(ponto.saldo)}`,
        );
      }
    }

    doc.end();
  });
}
