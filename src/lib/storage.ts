/**
 * Utilitário seguro para acesso ao armazenamento do navegador.
 * Previne falhas como "Access to storage is not allowed from this context"
 * em abas anônimas, iframes, bloqueadores de cookies ou extensões de terceiros.
 */

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryStorage = new MemoryStorage();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Falha silenciosa com fallback para memória volátil
    }
    return memoryStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Falha silenciosa
    }
    memoryStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Falha silenciosa
    }
    memoryStorage.removeItem(key);
  }
};
