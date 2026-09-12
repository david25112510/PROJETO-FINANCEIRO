type Entrada<T> = {
  valor: T;
  expiraEm: number;
};

/**
 * Cache em memória com TTL, escopo do processo Node.js (single instance).
 * Suficiente para o volume de indicadores do dashboard neste estágio do produto;
 * uma implantação multi-instância precisaria de um cache compartilhado (ex: Redis).
 */
class MemoryCache {
  private store = new Map<string, Entrada<unknown>>();

  get<T>(key: string): T | undefined {
    const entrada = this.store.get(key);
    if (!entrada) return undefined;
    if (Date.now() > entrada.expiraEm) {
      this.store.delete(key);
      return undefined;
    }
    return entrada.valor as T;
  }

  set<T>(key: string, valor: T, ttlMs: number): void {
    this.store.set(key, { valor, expiraEm: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

declare global {
  var __memoryCache: MemoryCache | undefined;
}

export const cache = global.__memoryCache ?? new MemoryCache();

if (process.env.NODE_ENV !== "production") {
  global.__memoryCache = cache;
}
