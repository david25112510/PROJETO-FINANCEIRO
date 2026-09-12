import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { simuladorService } from "@/services/inteligencia/simuladorService";

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json().catch(() => ({}));
  const resultado = await simuladorService.simular(user.id, body);
  return ok(resultado);
});
