import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { receitaService } from "@/services/financeiro/receitaService";
import { parseLancamentoFiltro, parsePaginacao } from "@/lib/pagination";

export const GET = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const searchParams = new URL(req.url).searchParams;
  const resultado = await receitaService.listar(
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
  const receitas = await receitaService.criar(user.id, body);
  return ok(receitas, 201);
});
