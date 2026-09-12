import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { cartaoService } from "@/services/cartoes/cartaoService";

export const GET = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const cartao = await cartaoService.buscarPorId(id, user.id);
  return ok(cartao);
});

export const PATCH = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const cartao = await cartaoService.atualizar(id, user.id, body);
  return ok(cartao);
});

export const DELETE = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  await cartaoService.excluir(id, user.id);
  return ok(null);
});
