import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { categoriaService } from "@/services/financeiro/categoriaService";

export const PATCH = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const categoria = await categoriaService.atualizar(id, user.id, body);
  return ok(categoria);
});

export const DELETE = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  await categoriaService.excluir(id, user.id);
  return ok(null);
});
