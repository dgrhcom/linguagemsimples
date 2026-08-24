import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runDeterministicAnalysis } from "@/lib/analysis/deterministic-engine";
import { calculateTextMetrics } from "@/lib/analysis/text-metrics";
import { calculateAnalysisScore } from "@/lib/analysis/score-calculator";
import { validateSemanticPreservation } from "@/lib/analysis/semantic-validator";
import { rewriteToPlainLanguage } from "@/lib/analysis/plain-language-rewriter";
import { getLanguageModelProvider } from "@/lib/ai";
import { AnalysisInput, AnalysisResult, Finding } from "@/types/analysis";

const inputSchema = z.object({
  text: z.string().min(1, "O texto para análise não pode estar vazio.").max(50000, "Texto muito longo (máximo 50.000 caracteres)."),
  documentType: z.enum([
    "general", "email", "notice", "official-letter", "memo", "report",
    "opinion", "declaration", "minutes", "ordinance", "resolution", "instruction", "regulation"
  ] as const).default("general"),
  targetAudience: z.string().optional(),
  textGoal: z.string().optional(),
  options: z.object({
    preserveTechnicalTerms: z.boolean().optional(),
    strictInclusiveMode: z.boolean().optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const input: AnalysisInput = parsed.data;

    // 1. Métricas de texto
    const metrics = calculateTextMetrics(input.text);

    // 2. Motor Determinístico
    const deterministicFindings = runDeterministicAnalysis(input);

    // 3. Análise e Reescrita por IA
    const aiProvider = getLanguageModelProvider();
    const aiOutput = await aiProvider.analyzeText(input, deterministicFindings);

    // 4. Consolidação de Findings (evitando duplicatas exatas)
    const combinedFindings: Finding[] = [...deterministicFindings];
    for (const af of aiOutput.findings) {
      const alreadyExists = combinedFindings.some(
        df => df.originalText.toLowerCase() === af.originalText.toLowerCase() && df.category === af.category
      );
      if (!alreadyExists) {
        combinedFindings.push(af);
      }
    }

    // 5. Cálculo do Score Multidimensional
    const score = calculateAnalysisScore(metrics, combinedFindings);

    // 6. Validação Semântica e Garantia de Reescrita
    let rewritten = aiOutput.rewrittenText;
    if (!rewritten || rewritten.trim() === input.text.trim()) {
      rewritten = rewriteToPlainLanguage(input.text);
    }
    const semanticValidation = validateSemanticPreservation(input.text, rewritten);

    const result: AnalysisResult = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input,
      metrics,
      score,
      findings: combinedFindings,
      rewrittenText: rewritten,
      semanticValidation,
      appliedRuleVersion: "Unicamp-LSI-v1.0"
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      { error: "Falha ao processar análise do texto.", message: error.message },
      { status: 500 }
    );
  }
}
