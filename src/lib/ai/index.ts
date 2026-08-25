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

export function getStoredAiHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const provider = localStorage.getItem("preferred_ai_provider");
    const geminiKey = localStorage.getItem("custom_gemini_api_key");
    const openaiKey = localStorage.getItem("custom_openai_api_key");

    if (provider === "openai" && openaiKey && openaiKey.trim()) {
      return { "x-ai-provider": "openai", "x-ai-api-key": openaiKey.trim() };
    }

    if (provider === "gemini" && geminiKey && geminiKey.trim()) {
      return { "x-ai-provider": "gemini", "x-ai-api-key": geminiKey.trim() };
    }

    // Se houver chave do Gemini salva, prioriza Gemini
    if (geminiKey && geminiKey.trim()) {
      return { "x-ai-provider": "gemini", "x-ai-api-key": geminiKey.trim() };
    }

    // Se houver chave da OpenAI salva
    if (openaiKey && openaiKey.trim()) {
      return { "x-ai-provider": "openai", "x-ai-api-key": openaiKey.trim() };
    }
  } catch (e) {}
  return {};
}


export * from "./provider";
export * from "./prompts";

