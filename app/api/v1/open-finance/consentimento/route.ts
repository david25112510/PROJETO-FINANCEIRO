import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { openFinanceService } from "@/services/openfinance/openFinanceService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const status = await openFinanceService.obterStatus(user.id);
  return ok(status);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json().catch(() => ({}));
  if (typeof body.consentido !== "boolean") {
    throw new ValidationError('Informe "consentido" como true ou false.', "CAMPO_INVALIDO");
  }

  const status = body.consentido
    ? await openFinanceService.concederConsentimento(user.id)
    : await openFinanceService.revogarConsentimento(user.id);

  return ok(status);
});
