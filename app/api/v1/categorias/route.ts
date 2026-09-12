import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { categoriaService } from "@/services/financeiro/categoriaService";

export const GET = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const tipoParam = new URL(req.url).searchParams.get("tipo");
  const tipo = tipoParam === "RECEITA" || tipoParam === "DESPESA" ? tipoParam : undefined;

  const categorias = await categoriaService.listar(user.id, tipo);
  return ok(categorias);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const categoria = await categoriaService.criar(user.id, body);
  return ok(categoria, 201);
});
