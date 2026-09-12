export type ResultadoRateLimit = {
  permitido: boolean;
  restantes: number;
  resetEm: number;
};

/**
 * Limitador de taxa em memória (janela deslizante), escopo do processo.
 * Mesma limitação de lib/cache.ts: em múltiplas instâncias precisaria de um
 * armazenamento compartilhado (ex.: Redis). Suficiente para este estágio.
 */
class RateLimiter {
  private store = new Map<string, number[]>();

  tentar(chave: string, limite: number, janelaMs: number): ResultadoRateLimit {
    const agora = Date.now();
    const timestamps = (this.store.get(chave) ?? []).filter((t) => agora - t < janelaMs);

    if (timestamps.length >= limite) {
      this.store.set(chave, timestamps);
      return { permitido: false, restantes: 0, resetEm: timestamps[0] + janelaMs };
    }

    timestamps.push(agora);
    this.store.set(chave, timestamps);
    return { permitido: true, restantes: limite - timestamps.length, resetEm: agora + janelaMs };
  }

  reiniciar(chave: string): void {
    this.store.delete(chave);
  }
}

declare global {
  var __rateLimiter: RateLimiter | undefined;
}

export const rateLimiter = global.__rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== "production") {
  global.__rateLimiter = rateLimiter;
}
