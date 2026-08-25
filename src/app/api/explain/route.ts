import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModelProvider } from "@/lib/ai";
import { Finding } from "@/types/analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const finding = body.finding as Finding;

    if (!finding || !finding.originalText) {
      return NextResponse.json({ error: "Achado não fornecido" }, { status: 400 });
    }

    const customApiKey = req.headers.get("x-ai-api-key") || undefined;
    const customProvider = (req.headers.get("x-ai-provider") as any) || undefined;

    const aiProvider = getLanguageModelProvider({ provider: customProvider, apiKey: customApiKey });
    const explanation = await aiProvider.explainFinding(finding);

    return NextResponse.json(explanation);

  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao gerar explicação", message: error.message }, { status: 500 });
  }
}
