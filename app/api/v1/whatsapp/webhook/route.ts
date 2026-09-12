import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { verificarAssinaturaWebhook } from "@/services/whatsapp/webhookSecurity";
import { whatsappService } from "@/services/whatsapp/whatsappService";

/**
 * Webhook do provedor WhatsApp (formato Meta Cloud API). Endpoint público —
 * chamado pelos servidores do provedor, não por um usuário logado — então
 * não usa createApiHandler/sessão; a autenticidade vem da verificação de
 * assinatura HMAC, não de cookies.
 */

// Verificação do webhook (handshake exigido pela Meta ao configurar a URL).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const tokenEsperado = process.env.WHATSAPP_VERIFY_TOKEN;
  if (tokenEsperado && mode === "subscribe" && token === tokenEsperado && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

type MensagemMeta = {
  from?: string;
  type?: string;
  text?: { body?: string };
};

export async function POST(req: NextRequest) {
  const payloadBruto = await req.text();

  if (!verificarAssinaturaWebhook(payloadBruto, req.headers.get("x-hub-signature-256"))) {
    logger.warn({ route: "/api/v1/whatsapp/webhook" }, "assinatura_invalida_ou_provedor_nao_configurado");
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const payload = JSON.parse(payloadBruto);
    const mensagens: MensagemMeta[] =
      payload?.entry?.flatMap((entrada: unknown) =>
        (entrada as { changes?: { value?: { messages?: MensagemMeta[] } }[] })?.changes?.flatMap(
          (mudanca) => mudanca?.value?.messages ?? [],
        ),
      ) ?? [];

    for (const mensagem of mensagens) {
      if (mensagem.type !== "text" || !mensagem.from || !mensagem.text?.body) continue;
      await whatsappService.processarMensagemRecebida(mensagem.from, mensagem.text.body);
    }
  } catch (error) {
    logger.error({ route: "/api/v1/whatsapp/webhook", err: error }, "erro_processando_webhook");
  }

  // A Meta espera 200 mesmo em erros de processamento, para não re-entregar o webhook indefinidamente.
  return new Response("OK", { status: 200 });
}
