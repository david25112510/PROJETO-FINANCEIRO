import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { dividaService } from "@/services/dividas/dividaService";

export const POST = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const divida = await dividaService.quitar(id, user.id, body);
  return ok(divida);
});
