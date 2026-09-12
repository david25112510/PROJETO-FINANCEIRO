import { cookies } from "next/headers";
import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { sessionTokenService } from "@/services/auth/sessionTokenService";
import { userService } from "@/services/auth/userService";
import { sessionRepository } from "@/repositories/sessionRepository";

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  await userService.trocarSenha(user.id, body);

  // Revoga as demais sessões (outros dispositivos), mantendo a sessão atual válida.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";
  await sessionRepository.revokeAllForUserExceto(user.id, sessionTokenService.hash(token));

  return ok(null);
});
