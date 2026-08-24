import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModelProvider } from "@/lib/ai";
import { validateSemanticPreservation } from "@/lib/analysis/semantic-validator";
import { AnalysisInput } from "@/types/analysis";
import { buildSegmentRewritePrompt } from "@/lib/ai/prompts";
import { rewriteToPlainLanguage } from "@/lib/analysis/plain-language-rewriter";

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
    const aiProvider = getLanguageModelProvider();

    if (mode === "segment") {
      // Reescrita de trecho específico
      const prompt = buildSegmentRewritePrompt(text, segmentIssue || "Tornar o trecho simples, direto e inclusivo", targetAudience);
      const input: AnalysisInput = { text, documentType, targetAudience, textGoal };
      const output = await aiProvider.rewriteText(input);

      let rewritten = output.rewrittenText.trim();
      if (!rewritten || rewritten === text.trim()) {
        rewritten = rewriteToPlainLanguage(text);
      }

      return NextResponse.json({
        rewrittenText: rewritten,
        mode: "segment"
      });
    }

    // Reescrita Completa
    const input: AnalysisInput = { text, documentType, targetAudience, textGoal };
    const output = await aiProvider.rewriteText(input);
    
    let rewritten = output.rewrittenText.trim();
    if (!rewritten || rewritten === text.trim()) {
      rewritten = rewriteToPlainLanguage(text);
    }
    const semanticValidation = validateSemanticPreservation(input.text, rewritten);

    return NextResponse.json({
      rewrittenText: rewritten,
      semanticValidation,
      mode: "full"
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao gerar reescrita", message: error.message }, { status: 500 });
  }
}
