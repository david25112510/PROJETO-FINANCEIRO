import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login"];

/**
 * Checagem leve (só existência do cookie) compatível com o runtime Edge do
 * middleware, que não consegue abrir conexão TCP com o Postgres via driver
 * adapter. A validação real da sessão contra o banco acontece em
 * app/(app)/layout.tsx (Server Component, runtime Node.js), que é a fonte
 * de verdade e redireciona para /login se a sessão não for válida/expirada.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!hasSessionCookie && !isPublicRoute && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirecionarPara", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
