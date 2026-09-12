import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { receitaService } from "@/services/financeiro/receitaService";

export const GET = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const receita = await receitaService.buscarPorId(id, user.id);
  return ok(receita);
});

export const PATCH = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const receita = await receitaService.atualizar(id, user.id, body);
  return ok(receita);
});

export const DELETE = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const serieCompleta = new URL(req.url).searchParams.get("serieCompleta") === "true";
  await receitaService.excluir(id, user.id, { serieCompleta });
  return ok(null);
});
