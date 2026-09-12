import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { financiamentoService } from "@/services/financiamentos/financiamentoService";

export const GET = createApiHandler(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const { id } = await params;
  const amortizacao = await financiamentoService.amortizacao(id, user.id);
  return ok(amortizacao);
});
