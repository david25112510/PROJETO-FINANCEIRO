import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifica a assinatura HMAC SHA-256 de um webhook (padrão da Meta Cloud API:
 * header `X-Hub-Signature-256: sha256=<hex>` sobre o corpo bruto da
 * requisição, usando o App Secret como chave). Sem `WHATSAPP_APP_SECRET`
 * configurado, o webhook é considerado não configurado e nada é aceito.
 */
export function verificarAssinaturaWebhook(payloadBruto: string, assinaturaHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !assinaturaHeader) return false;

  const esperada = `sha256=${createHmac("sha256", appSecret).update(payloadBruto).digest("hex")}`;

  const bufEsperado = Buffer.from(esperada);
  const bufRecebido = Buffer.from(assinaturaHeader);
  if (bufEsperado.length !== bufRecebido.length) return false;

  return timingSafeEqual(bufEsperado, bufRecebido);
}
