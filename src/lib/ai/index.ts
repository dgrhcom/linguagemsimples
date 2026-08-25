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

export * from "./provider";
export * from "./prompts";
