import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { dividaService } from "@/services/dividas/dividaService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const dividas = await dividaService.listar(user.id);
  return ok(dividas);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const divida = await dividaService.criar(user.id, body);
  return ok(divida, 201);
});
