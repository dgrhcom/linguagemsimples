import { LanguageModelProvider } from "./provider";
import { MockLanguageModelProvider } from "./mock-provider";
import { GeminiLanguageModelProvider } from "./gemini-provider";
import { OpenAILanguageModelProvider } from "./openai-provider";

export function getLanguageModelProvider(): LanguageModelProvider {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    return new GeminiLanguageModelProvider(geminiKey);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return new OpenAILanguageModelProvider(openaiKey);
  }

  // Fallback padrão sem chaves externas
  return new MockLanguageModelProvider();
}

export * from "./provider";
export * from "./prompts";
