import { z } from "zod";
import { authService } from "@/services/auth/authService";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createApiHandler } from "@/lib/api-handler";
import { ok, fail } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";
import { rateLimiter } from "@/lib/rateLimit";

const verificarTotpSchema = z.object({
  loginPendenteId: z.string().min(1),
  codigo: z.string().min(6),
});

const LIMITE_TENTATIVAS = 10;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;

export const POST = createApiHandler(async (req) => {
  const body = await req.json();
  const { loginPendenteId, codigo } = verificarTotpSchema.parse(body);
  const meta = await getRequestMeta();

  const chave = `totp:${loginPendenteId}`;
  const limite = rateLimiter.tentar(chave, LIMITE_TENTATIVAS, JANELA_RATE_LIMIT_MS);
  if (!limite.permitido) {
    return fail("MUITAS_TENTATIVAS", "Muitas tentativas. Faça login novamente.", 429);
  }

  const { user, token, expiresAt } = await authService.verificarTotpLogin(loginPendenteId, codigo, meta);

  const response = ok(user);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return response;
});
