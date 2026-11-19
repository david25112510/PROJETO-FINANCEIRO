import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";
import { ok, fail } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";
import { rateLimiter } from "@/lib/rateLimit";
import { passwordResetService } from "@/services/auth/passwordResetService";

const schema = z.object({ email: z.email("E-mail inválido.").trim().toLowerCase() });
const LIMITE_POR_IP = 5;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;
const MENSAGEM_GENERICA = "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.";

export const POST = createApiHandler(async (req) => {
  const meta = await getRequestMeta();
  const chaveIp = `recuperar-senha:${meta.ipAddress ?? "desconhecido"}`;
  const limite = rateLimiter.tentar(chaveIp, LIMITE_POR_IP, JANELA_RATE_LIMIT_MS);
  if (!limite.permitido) {
    return fail("MUITAS_TENTATIVAS", "Muitas solicitações. Tente novamente mais tarde.", 429);
  }

  const { email } = schema.parse(await req.json());
  const baseUrl = process.env.APP_BASE_URL || new URL(req.url).origin;
  const configurado = await passwordResetService.requestReset(email, baseUrl);
  if (!configurado) {
    return fail(
      "RECUPERACAO_NAO_CONFIGURADA",
      "A recuperação por e-mail ainda não está configurada. Entre em contato com o administrador.",
      503,
    );
  }

  return ok({ message: MENSAGEM_GENERICA });
});
