import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { segurancaService } from "@/services/auth/segurancaService";

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const resultado = await segurancaService.confirmarAtivacaoTotp(user.id, body);
  return ok(resultado);
});
