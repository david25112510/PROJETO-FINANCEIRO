import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { segurancaService } from "@/services/auth/segurancaService";

export const POST = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const resultado = await segurancaService.iniciarAtivacaoTotp(user.id);
  return ok(resultado);
});
