import { userService } from "@/services/auth/userService";
import { authService } from "@/services/auth/authService";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createApiHandler } from "@/lib/api-handler";
import { ok, fail } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";
import { rateLimiter } from "@/lib/rateLimit";

const LIMITE_CADASTROS_POR_IP = 5;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;

export const POST = createApiHandler(async (req) => {
  const meta = await getRequestMeta();
  const chaveIp = `cadastro:${meta.ipAddress ?? "desconhecido"}`;
  const limite = rateLimiter.tentar(chaveIp, LIMITE_CADASTROS_POR_IP, JANELA_RATE_LIMIT_MS);
  if (!limite.permitido) {
    return fail("MUITAS_TENTATIVAS", "Muitas tentativas de cadastro. Tente novamente mais tarde.", 429);
  }

  const body = await req.json();
  const user = await userService.createUser(body, null);
  const resultado = await authService.login(body.email, body.password, meta);

  if (resultado.requerTotp) {
    return fail("CADASTRO_INCOMPLETO", "Não foi possível concluir o cadastro. Tente entrar novamente.", 500);
  }

  const response = ok({ user });
  response.cookies.set(SESSION_COOKIE_NAME, resultado.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: resultado.expiresAt,
  });

  return response;
});
