import "server-only";
import { cookies, headers } from "next/headers";
import { authService, type SafeUser, type RequestMeta } from "@/services/auth/authService";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

export async function getRequestMeta(): Promise<RequestMeta> {
  const headersList = await headers();
  return {
    userAgent: headersList.get("user-agent"),
    ipAddress: headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };
}

/**
 * Lê o cookie de sessão e valida contra o banco (via authService).
 * Usado em Server Components e nas rotas de API — fonte de verdade da autenticação,
 * complementando a checagem leve feita no middleware.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return authService.validateSession(token);
}
