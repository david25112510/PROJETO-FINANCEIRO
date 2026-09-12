import { z } from "zod";
import { createApiHandler } from "@/lib/api-handler";
import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { whatsappService } from "@/services/whatsapp/whatsappService";

const vincularSchema = z.object({
  numero: z.string().min(8, "Informe um número de telefone válido."),
});

export const POST = createApiHandler(async (req) => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const body = await req.json();
  const { numero } = vincularSchema.parse(body);

  const resultado = await whatsappService.iniciarVinculo(user.id, numero);
  return ok(resultado);
});

export const DELETE = createApiHandler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  await whatsappService.desvincular(user.id);
  return ok(null);
});
