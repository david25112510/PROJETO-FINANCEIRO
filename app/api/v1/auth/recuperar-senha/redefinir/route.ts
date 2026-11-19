import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";
import { ok, fail } from "@/lib/api-response";
import { getRequestMeta } from "@/lib/session";
import { rateLimiter } from "@/lib/rateLimit";
import { passwordResetService } from "@/services/auth/passwordResetService";

const schema = z.object({ token: z.string().trim().min(1).max(200), password: z.string().min(1) });
const LIMITE_POR_IP = 10;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;

export const POST = createApiHandler(async (req) => {
  const meta = await getRequestMeta();
  const chaveIp = `redefinir-senha:${meta.ipAddress ?? "desconhecido"}`;
  const limite = rateLimiter.tentar(chaveIp, LIMITE_POR_IP, JANELA_RATE_LIMIT_MS);
  if (!limite.permitido) {
    return fail("MUITAS_TENTATIVAS", "Muitas tentativas. Tente novamente mais tarde.", 429);
  }

  const { token, password } = schema.parse(await req.json());
  await passwordResetService.resetPassword(token, password, meta.ipAddress);

  return ok(null);
});
