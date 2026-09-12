import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { despesaService } from "@/services/financeiro/despesaService";
import { parseLancamentoFiltro, parsePaginacao } from "@/lib/pagination";

export const GET = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const searchParams = new URL(req.url).searchParams;
  const resultado = await despesaService.listar(
    user.id,
    parseLancamentoFiltro(searchParams),
    parsePaginacao(searchParams),
  );
  return ok(resultado);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const despesas = await despesaService.criar(user.id, body);
  return ok(despesas, 201);
});
