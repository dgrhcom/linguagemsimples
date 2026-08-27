import { AnalysisScore } from "@/types/score";
import { TextMetrics } from "@/types/analysis";
import { PillarCard } from "./pillar-card";
import { Award, FileText, AlignLeft, ShieldAlert } from "lucide-react";

interface ScoreOverviewProps {
  score: AnalysisScore;
  metrics: TextMetrics;
}

export function ScoreOverview({ score, metrics }: ScoreOverviewProps) {
  const levelBadge = {
    excelente: { label: "Excelente Nível", cls: "bg-amber text-ink border-amber-dark" },
    bom: { label: "Bom Nível", cls: "bg-ink text-amber border-slate" },
    atencao: { label: "Atenção Necessária", cls: "bg-ink text-amber-light border-slate" },
    critico: { label: "Necessita Revisão", cls: "bg-ink text-rose-300 border-slate" }
  }[score.overallLevel];

  return (
    <div className="space-y-section">
      {/* Banner Principal — Ink Field surface */}
      <div className="bg-ink rounded-card p-8 sm:p-10 relative overflow-hidden border border-slate">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-micro-label font-sans px-3 py-1 rounded-tag border ${levelBadge.cls}`}>
                {levelBadge.label}
              </span>
              <span className="text-micro-label font-sans text-stone">Metodologia Oficial Unicamp</span>
            </div>
            <h2 className="font-display text-heading sm:text-heading-sm text-paper mb-3">
              Diagnóstico de Linguagem Simples
            </h2>
            <p className="text-body text-stone leading-relaxed">
              {score.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-ink-dark px-8 py-5 rounded-tile border border-slate">
            <div className="text-center">
              <div className="font-display text-display sm:text-heading-lg text-amber tracking-editorial">
                {score.overallScore}
              </div>
              <div className="text-micro-label font-sans text-stone mt-1">
                Pontuação Geral
              </div>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="mt-8 pt-6 border-t border-slate grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber" />
            <span><strong className="text-paper">{metrics.wordsCount ?? metrics.wordCount ?? 0}</strong> palavras</span>
          </div>
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-amber" />
            <span><strong className="text-paper">{metrics.sentencesCount ?? metrics.sentenceCount ?? 0}</strong> frases ({metrics.avgSentenceLengthWords ?? metrics.avgWordsPerSentence ?? 0} pal/frase)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber" />
            <span><strong className="text-paper">{metrics.longSentencesCount}</strong> frases longas (&gt; 20 pal.)</span>
          </div>
          <div className="flex items-center gap-2">
            <span><strong className="text-paper">{Math.max(1, Math.round((metrics.readingTimeSeconds ?? 60) / 60))}</strong> min de leitura</span>
          </div>
        </div>
      </div>

      {/* Os Três Pilares */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber" />
          <h3 className="font-display text-subheading text-ink">Os Três Pilares da Comunicação Clara</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard pillar={score.pillars.encontrar} />
          <PillarCard pillar={score.pillars.compreender} />
          <PillarCard pillar={score.pillars.usar} />
        </div>
      </div>

      {/* Dimensões Avaliadas */}
      <div className="bg-paper border border-sand rounded-card p-6">
        <h3 className="text-micro-label font-sans text-stone mb-4">
          Avaliação por Dimensão Linguística
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {score.dimensions.map(dim => (
            <div key={dim.key} className="bg-sand/30 border border-sand rounded-tile p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-body-sm font-display text-ink truncate pr-2">
                  {dim.label}
                </span>
                <span className="text-caption font-sans px-2 py-0.5 rounded-btn border bg-paper border-sand text-ink">
                  {dim.score}
                </span>
              </div>
              <p className="text-caption text-charcoal leading-snug line-clamp-2">
                {dim.description}
              </p>
              {dim.findingsCount > 0 && (
                <span className="inline-block mt-2 text-micro-label font-sans text-stone bg-amber/10 border border-amber/30 px-2 py-0.5 rounded-btn">
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
