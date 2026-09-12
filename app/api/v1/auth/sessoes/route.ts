import { cookies } from "next/headers";
import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { sessionTokenService } from "@/services/auth/sessionTokenService";
import { segurancaService } from "@/services/auth/segurancaService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";
  const tokenHashAtual = sessionTokenService.hash(token);

  const sessoes = await segurancaService.listarSessoes(user.id, tokenHashAtual);
  return ok(sessoes);
});
