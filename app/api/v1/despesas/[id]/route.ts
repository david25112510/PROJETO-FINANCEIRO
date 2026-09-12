import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { despesaService } from "@/services/financeiro/despesaService";

export const GET = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const despesa = await despesaService.buscarPorId(id, user.id);
  return ok(despesa);
});

export const PATCH = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const despesa = await despesaService.atualizar(id, user.id, body);
  return ok(despesa);
});

export const DELETE = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const serieCompleta = new URL(req.url).searchParams.get("serieCompleta") === "true";
  await despesaService.excluir(id, user.id, { serieCompleta });
  return ok(null);
});
