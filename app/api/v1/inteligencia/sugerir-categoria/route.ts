import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { categorizacaoService } from "@/services/inteligencia/categorizacaoService";

export const GET = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const searchParams = new URL(req.url).searchParams;
  const descricao = searchParams.get("descricao") ?? "";
  const tipo = searchParams.get("tipo");

  if (tipo !== "RECEITA" && tipo !== "DESPESA") {
    throw new ValidationError('Informe "tipo" como "RECEITA" ou "DESPESA".', "TIPO_INVALIDO");
  }

  const sugestao = await categorizacaoService.sugerir(user.id, descricao, tipo);
  return ok(sugestao);
});
