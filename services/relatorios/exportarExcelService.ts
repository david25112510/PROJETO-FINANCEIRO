import ExcelJS from "exceljs";
import type { RelatorioResultado } from "@/services/relatorios/relatorioService";
import { formatarData } from "@/lib/format";

export async function gerarExcelRelatorio(relatorio: RelatorioResultado): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FinanceOps";
  workbook.created = new Date();

  const resumoSheet = workbook.addWorksheet("Resumo");
  resumoSheet.columns = [
    { header: "Indicador", key: "indicador", width: 32 },
    { header: "Valor", key: "valor", width: 20 },
  ];
  resumoSheet.addRow({
    indicador: "Período",
    valor: `${formatarData(relatorio.periodo.dataInicio)} a ${formatarData(relatorio.periodo.dataFim)}`,
  });
  resumoSheet.addRow({ indicador: "Total de receitas", valor: relatorio.periodo.totalReceitas });
  resumoSheet.addRow({ indicador: "Total de despesas", valor: relatorio.periodo.totalDespesas });
  resumoSheet.addRow({ indicador: "Saldo", valor: relatorio.periodo.saldo });

  if (relatorio.comparacao) {
    resumoSheet.addRow({});
    resumoSheet.addRow({
      indicador: "Período de comparação",
      valor: `${formatarData(relatorio.comparacao.dataInicio)} a ${formatarData(relatorio.comparacao.dataFim)}`,
    });
    resumoSheet.addRow({ indicador: "Receitas (período de comparação)", valor: relatorio.comparacao.totalReceitas });
    resumoSheet.addRow({ indicador: "Despesas (período de comparação)", valor: relatorio.comparacao.totalDespesas });
    resumoSheet.addRow({ indicador: "Saldo (período de comparação)", valor: relatorio.comparacao.saldo });
    resumoSheet.addRow({ indicador: "Variação de receitas (%)", valor: relatorio.comparacao.variacaoReceitas });
    resumoSheet.addRow({ indicador: "Variação de despesas (%)", valor: relatorio.comparacao.variacaoDespesas });
    resumoSheet.addRow({ indicador: "Variação de saldo (%)", valor: relatorio.comparacao.variacaoSaldo });
  }

  const categoriasSheet = workbook.addWorksheet("Por Categoria");
  categoriasSheet.columns = [
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Categoria", key: "categoria", width: 28 },
    { header: "Total", key: "total", width: 16 },
  ];
  for (const item of relatorio.receitasPorCategoria) {
    categoriasSheet.addRow({ tipo: "Receita", categoria: item.nome, total: item.total });
  }
  for (const item of relatorio.despesasPorCategoria) {
    categoriasSheet.addRow({ tipo: "Despesa", categoria: item.nome, total: item.total });
  }

  const serieSheet = workbook.addWorksheet("Série Mensal");
  serieSheet.columns = [
    { header: "Mês", key: "mes", width: 8 },
    { header: "Ano", key: "ano", width: 8 },
    { header: "Receitas", key: "receitas", width: 16 },
    { header: "Despesas", key: "despesas", width: 16 },
    { header: "Saldo", key: "saldo", width: 16 },
  ];
  for (const ponto of relatorio.serieMensal) {
    serieSheet.addRow(ponto);
  }

  for (const sheet of [resumoSheet, categoriasSheet, serieSheet]) {
    sheet.getRow(1).font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
