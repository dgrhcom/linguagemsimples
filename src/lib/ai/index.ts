import { LanguageModelProvider } from "./provider";
import { MockLanguageModelProvider } from "./mock-provider";
import { GeminiLanguageModelProvider } from "./gemini-provider";
import { OpenAILanguageModelProvider } from "./openai-provider";

export function getLanguageModelProvider(customConfig?: { provider?: "gemini" | "openai"; apiKey?: string }): LanguageModelProvider {
  // 1. Chave enviada customizada pelo cliente
  if (customConfig?.apiKey && customConfig.apiKey.trim()) {
    if (customConfig.provider === "openai") {
      return new OpenAILanguageModelProvider(customConfig.apiKey.trim());
    }
    return new GeminiLanguageModelProvider(customConfig.apiKey.trim());
  }

  // 2. Chave configurada em variável de ambiente (.env.local)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim()) {
    return new GeminiLanguageModelProvider(geminiKey.trim());
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey.trim()) {
    return new OpenAILanguageModelProvider(openaiKey.trim());
  }

  // 3. Fallback padrão: Motor Estruturado da Unicamp
  return new MockLanguageModelProvider();
}

import { safeStorage } from "@/lib/storage";

/**
 * Sanitiza valores para garantir que sejam estritamente ASCII imprimíveis (33-126).
 * Cabeçalhos HTTP do browser 'fetch' rejeitam qualquer caractere > 255 (non-ISO-8859-1),
 * causando 'TypeError: Failed to read the headers property from RequestInit: String contains non ISO-8859-1 code point'.
 */
export function sanitizeHeaderValue(val: unknown): string | null {
  if (typeof val !== "string") return null;
  // Permite apenas caracteres ASCII imprimíveis sem espaços para chaves/provedores
  const cleaned = val.replace(/[^\x21-\x7E]/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function getStoredAiHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const rawProvider = safeStorage.getItem("preferred_ai_provider");
    // Se explicitamente offline, nunca envia headers de IA
    if (rawProvider === "offline") return {};

    const rawGeminiKey = safeStorage.getItem("custom_gemini_api_key");
    const rawOpenaiKey = safeStorage.getItem("custom_openai_api_key");

    const geminiKey = sanitizeHeaderValue(rawGeminiKey);
    const openaiKey = sanitizeHeaderValue(rawOpenaiKey);
    const provider = sanitizeHeaderValue(rawProvider);

    if (provider === "openai" && openaiKey) {
      return { "x-ai-provider": "openai", "x-ai-api-key": openaiKey };
    }

    if (provider === "gemini" && geminiKey) {
      return { "x-ai-provider": "gemini", "x-ai-api-key": geminiKey };
    }

    // Se houver chave do Gemini salva e não estiver explicitamente em offline
    if (geminiKey && provider !== "offline") {
      return { "x-ai-provider": "gemini", "x-ai-api-key": geminiKey };
    }

    // Se houver chave da OpenAI salva e não estiver explicitamente em offline
    if (openaiKey && provider !== "offline") {
      return { "x-ai-provider": "openai", "x-ai-api-key": openaiKey };
    }
  } catch (e) {
    console.error("Erro ao obter headers de IA:", e);
  }
  return {};
}



export * from "./provider";
export * from "./prompts";

