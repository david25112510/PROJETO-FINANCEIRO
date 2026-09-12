import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { importacaoService } from "@/services/importacao/importacaoService";

export const GET = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const historico = await importacaoService.historico(user.id);
  return ok(historico);
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const formData = await req.formData();
  const arquivo = formData.get("arquivo");

  if (!(arquivo instanceof File)) {
    throw new ValidationError('Envie o arquivo no campo "arquivo".', "ARQUIVO_AUSENTE");
  }

  const conteudo = await arquivo.text();
  const relatorio = await importacaoService.importar(user.id, arquivo.name, conteudo);
  return ok(relatorio, 201);
});
