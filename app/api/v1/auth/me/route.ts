import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return ok(user);
});
