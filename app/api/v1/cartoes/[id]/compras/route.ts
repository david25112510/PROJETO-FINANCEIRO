import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { compraService } from "@/services/cartoes/compraService";

export const POST = createApiHandler(async (req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const body = await req.json();
  const compras = await compraService.criar(user.id, { ...body, cartaoId: id });
  return ok(compras, 201);
});
