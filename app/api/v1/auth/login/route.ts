import { z } from "zod";
import { authService } from "@/services/auth/authService";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createApiHandler } from "@/lib/api-handler";
import { ok, fail } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";
import { rateLimiter } from "@/lib/rateLimit";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail."),
  password: z.string().min(1, "Informe a senha."),
});

const LIMITE_TENTATIVAS_POR_IP = 20;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;

export const POST = createApiHandler(async (req) => {
  const meta = await getRequestMeta();

  const chaveIp = `login:${meta.ipAddress ?? "desconhecido"}`;
  const limite = rateLimiter.tentar(chaveIp, LIMITE_TENTATIVAS_POR_IP, JANELA_RATE_LIMIT_MS);
  if (!limite.permitido) {
    return fail(
      "MUITAS_TENTATIVAS",
      "Muitas tentativas de login a partir deste endereço. Tente novamente mais tarde.",
      429,
    );
  }

  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const resultado = await authService.login(email, password, meta);

  if (resultado.requerTotp) {
    return ok({ requerTotp: true, loginPendenteId: resultado.loginPendenteId });
  }

  const response = ok({ requerTotp: false as const, user: resultado.user });
  response.cookies.set(SESSION_COOKIE_NAME, resultado.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: resultado.expiresAt,
  });

  return response;
});
