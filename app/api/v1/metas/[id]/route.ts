import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { metaService } from "@/services/metas/metaService";

export const GET = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const meta = await metaService.buscarPorId(id, user.id);
  return ok(meta);
});

export const PATCH = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const meta = await metaService.atualizar(id, user.id, body);
  return ok(meta);
});

export const DELETE = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  await metaService.excluir(id, user.id);
  return ok(null);
});
