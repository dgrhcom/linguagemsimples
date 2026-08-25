import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModelProvider } from "@/lib/ai";
import { validateSemanticPreservation } from "@/lib/analysis/semantic-validator";
import { AnalysisInput } from "@/types/analysis";
import { buildSegmentRewritePrompt } from "@/lib/ai/prompts";
import { rewriteToPlainLanguage, guaranteeDifferentSuggestion } from "@/lib/analysis/plain-language-rewriter";

const inputSchema = z.object({
  text: z.string().min(1).max(50000),
  mode: z.enum(["full", "segment"]).default("full"),
  segmentIssue: z.string().optional(),
  documentType: z.enum([
    "general", "email", "notice", "official-letter", "memo", "report",
    "opinion", "declaration", "minutes", "ordinance", "resolution", "instruction", "regulation"
  ] as const).default("general"),
  targetAudience: z.string().optional(),
  textGoal: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const { text, mode, segmentIssue, documentType, targetAudience, textGoal } = parsed.data;

    // Headers opcionais de API Key enviados pelo cliente
    const customApiKey = req.headers.get("x-ai-api-key") || undefined;
    const customProvider = (req.headers.get("x-ai-provider") as any) || undefined;

    const aiProvider = getLanguageModelProvider({ provider: customProvider, apiKey: customApiKey });
    const unicampBase = rewriteToPlainLanguage(text);
    const input: AnalysisInput = { text, documentType, targetAudience, textGoal };

    if (mode === "segment") {
      // Reescrita de trecho/frase específica com IA utilizando a base da Unicamp
      const output = await aiProvider.rewriteText(input, {
        mode: "segment",
        segmentIssue,
        unicampBase,
        targetAudience
      });

      let rewritten = output.rewrittenText.trim();
      if (!rewritten || rewritten === text.trim()) {
        rewritten = guaranteeDifferentSuggestion(text, unicampBase);
      }

      return NextResponse.json({
        rewrittenText: rewritten,
        mode: "segment"
      });
    }

    // Reescrita Completa com IA utilizando a base da Unicamp
    const output = await aiProvider.rewriteText(input, {
      mode: "full",
      unicampBase,
      targetAudience
    });
    
    let rewritten = output.rewrittenText.trim();
    if (!rewritten || rewritten === input.text.trim()) {
      rewritten = guaranteeDifferentSuggestion(input.text, unicampBase);
    }
    const semanticValidation = validateSemanticPreservation(input.text, rewritten);

    return NextResponse.json({
      rewrittenText: rewritten,
      semanticValidation,
      mode: "full"
    });

  } catch (error: any) {
    console.error("API /api/rewrite error:", error);
    return NextResponse.json({ error: "Erro ao gerar reescrita", message: error.message }, { status: 500 });
  }
}

