import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { financiamentoService } from "@/services/financiamentos/financiamentoService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const financiamentos = await financiamentoService.listar(user.id);
  return ok(financiamentos);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const financiamento = await financiamentoService.criar(user.id, body);
  return ok(financiamento, 201);
});
