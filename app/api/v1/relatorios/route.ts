import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { relatorioService } from "@/services/relatorios/relatorioService";

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
  const relatorio = await relatorioService.gerar(user.id, filtroDeQuery(searchParams));
  return ok(relatorio);
});
