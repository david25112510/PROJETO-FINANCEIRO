import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { cartaoService } from "@/services/cartoes/cartaoService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const cartoes = await cartaoService.listar(user.id);
  return ok(cartoes);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const cartao = await cartaoService.criar(user.id, body);
  return ok(cartao, 201);
});
