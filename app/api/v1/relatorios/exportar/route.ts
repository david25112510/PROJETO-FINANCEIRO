import { createApiHandler } from "@/lib/api-handler";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { relatorioService } from "@/services/relatorios/relatorioService";
import { gerarExcelRelatorio } from "@/services/relatorios/exportarExcelService";
import { gerarPdfRelatorio } from "@/services/relatorios/exportarPdfService";

function filtroDeQuery(searchParams: URLSearchParams) {
  return {
    dataInicio: searchParams.get("dataInicio") ?? undefined,
    dataFim: searchParams.get("dataFim") ?? undefined,
    categoriaId: searchParams.get("categoriaId") ?? undefined,
    compararDataInicio: searchParams.get("compararDataInicio") ?? undefined,
    compararDataFim: searchParams.get("compararDataFim") ?? undefined,
  };
}

export const GET = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const searchParams = new URL(req.url).searchParams;
  const formato = searchParams.get("formato");
  if (formato !== "pdf" && formato !== "xlsx") {
    throw new ValidationError('Informe "formato" como "pdf" ou "xlsx".', "FORMATO_INVALIDO");
  }

  const relatorio = await relatorioService.gerar(user.id, filtroDeQuery(searchParams));
  const nomeArquivo = `relatorio-financeops-${relatorio.periodo.dataInicio.slice(0, 10)}-a-${relatorio.periodo.dataFim.slice(0, 10)}`;

  if (formato === "pdf") {
    const pdf = await gerarPdfRelatorio(relatorio);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}.pdf"`,
      },
    });
  }

  const excel = await gerarExcelRelatorio(relatorio);
  return new Response(new Uint8Array(excel), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomeArquivo}.xlsx"`,
    },
  });
});
