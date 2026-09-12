/**
 * Porta (arquitetura hexagonal) que um provedor real de WhatsApp Business API
 * (Meta Cloud API, Twilio, 360dialog etc.) implementaria para enviar
 * mensagens. Nenhuma implementação concreta existe neste projeto — plugar um
 * provedor real é o próximo passo fora do escopo atual. O recebimento de
 * mensagens (webhook) já funciona de forma independente do envio.
 */
export interface ProvedorWhatsApp {
  nome: string;
  enviarMensagem(numeroDestino: string, texto: string): Promise<void>;
}

/** Nenhum provedor real está configurado — placeholder intencional. */
export function obterProvedorConfigurado(): ProvedorWhatsApp | null {
  return null;
}
