import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { segurancaService } from "@/services/auth/segurancaService";

export const DELETE = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  await segurancaService.revogarSessao(id, user.id);
  return ok(null);
});
