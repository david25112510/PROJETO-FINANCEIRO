import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { dashboardService } from "@/services/dashboard/dashboardService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const indicadores = await dashboardService.getIndicadores(user.id);
  return ok(indicadores);
});
