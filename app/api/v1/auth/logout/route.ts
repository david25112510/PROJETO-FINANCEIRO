import { cookies } from "next/headers";
import { authService } from "@/services/auth/authService";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";

export const POST = createApiHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const meta = await getRequestMeta();

  if (token) {
    await authService.logout(token, meta);
  }

  const response = ok(null);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
});
