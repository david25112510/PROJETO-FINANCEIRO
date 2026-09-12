import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { compraService } from "@/services/cartoes/compraService";

export const DELETE = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  await compraService.excluir(id, user.id);
  return ok(null);
});
