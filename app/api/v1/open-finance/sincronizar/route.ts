import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { openFinanceService } from "@/services/openfinance/openFinanceService";

export const POST = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const resultado = await openFinanceService.sincronizar(user.id);
  return ok(resultado);
});
