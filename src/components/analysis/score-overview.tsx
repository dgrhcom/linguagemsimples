import { AnalysisScore } from "@/types/score";
import { TextMetrics } from "@/types/analysis";
import { PillarCard } from "./pillar-card";
import { Award, FileText, AlignLeft, ShieldAlert } from "lucide-react";

interface ScoreOverviewProps {
  score: AnalysisScore;
  metrics: TextMetrics;
}

export function ScoreOverview({ score, metrics }: ScoreOverviewProps) {
  const levelConfig = {
    excelente: { label: "Excelente Nível", bgColor: "#d97757", textColor: "#141413", borderColor: "#c6613f" },
    bom: { label: "Bom Nível", bgColor: "#141413", textColor: "#d97757", borderColor: "#3d3d3a" },
    atencao: { label: "Atenção Necessária", bgColor: "#141413", textColor: "#d97757", borderColor: "#3d3d3a" },
    critico: { label: "Necessita Revisão", bgColor: "#141413", textColor: "#fca5a5", borderColor: "#3d3d3a" }
  }[score.overallLevel];

  return (
    <div className="space-y-[80px]">
      {/* Banner Principal — Slate Dark surface */}
      <div className="rounded-[24px] p-8 sm:p-10 relative overflow-hidden" style={{ backgroundColor: "#141413", border: "1px solid #3d3d3a" }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[10px] font-semibold px-3 py-1 rounded-[0px]"
                style={{ backgroundColor: levelConfig.bgColor, color: levelConfig.textColor, border: `1px solid ${levelConfig.borderColor}` }}
              >
                {levelConfig.label}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: "#b0aea5" }}>Metodologia Oficial Unicamp</span>
            </div>
            <h2 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px] mb-3" style={{ color: "#faf9f5" }}>
              Diagnóstico de Linguagem Simples
            </h2>
            <p className="text-[20px] leading-[1.4]" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
              {score.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 px-8 py-5 rounded-[12px]" style={{ backgroundColor: "#3d3d3a", border: "1px solid #3d3d3a" }}>
            <div className="text-center">
              <div className="font-sans text-[68px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#d97757" }}>
                {score.overallScore}
              </div>
              <div className="text-[10px] font-semibold mt-1" style={{ color: "#b0aea5" }}>
                Pontuação Geral
              </div>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]" style={{ borderTop: "1px solid #3d3d3a", color: "#b0aea5" }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: "#d97757" }} />
            <span><strong style={{ color: "#faf9f5" }}>{metrics.wordsCount ?? metrics.wordCount ?? 0}</strong> palavras</span>
          </div>
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4" style={{ color: "#d97757" }} />
            <span><strong style={{ color: "#faf9f5" }}>{metrics.sentencesCount ?? metrics.sentenceCount ?? 0}</strong> frases ({metrics.avgSentenceLengthWords ?? metrics.avgWordsPerSentence ?? 0} pal/frase)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" style={{ color: "#d97757" }} />
            <span><strong style={{ color: "#faf9f5" }}>{metrics.longSentencesCount}</strong> frases longas (&gt; 20 pal.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span><strong style={{ color: "#faf9f5" }}>{Math.max(1, Math.round((metrics.readingTimeSeconds ?? 60) / 60))}</strong> min de leitura</span>
          </div>
        </div>
      </div>

      {/* Os Três Pilares */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5" style={{ color: "#d97757" }} />
          <h3 className="text-[24px] leading-[1.3] tracking-[-0.05px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>Os Três Pilares da Comunicação Clara</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard pillar={score.pillars.encontrar} />
          <PillarCard pillar={score.pillars.compreender} />
          <PillarCard pillar={score.pillars.usar} />
        </div>
      </div>

      {/* Dimensões Avaliadas */}
      <div className="rounded-[24px] p-6" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        <h3 className="text-[10px] font-semibold mb-4" style={{ color: "#b0aea5" }}>
          Avaliação por Dimensão Linguística
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {score.dimensions.map(dim => (
            <div key={dim.key} className="p-4 rounded-[12px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[14px] truncate pr-2" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>
                  {dim.label}
                </span>
                <span className="text-[12px] px-2 py-0.5 rounded-[8px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}>
                  {dim.score}
                </span>
              </div>
              <p className="text-[12px] leading-snug line-clamp-2" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
                {dim.description}
              </p>
              {dim.findingsCount > 0 && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-[8px]" style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", border: "1px solid rgba(217, 119, 87, 0.3)", color: "#141413" }}>
                  {dim.findingsCount} apontamento(s)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
