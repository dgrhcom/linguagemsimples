import { AnalysisScore } from "@/types/score";
import { TextMetrics } from "@/types/analysis";
import { PillarCard } from "./pillar-card";
import { Award, Clock, FileText, AlignLeft, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";

interface ScoreOverviewProps {
  score: AnalysisScore;
  metrics: TextMetrics;
}

export function ScoreOverview({ score, metrics }: ScoreOverviewProps) {
  const levelBadge = {
    excelente: { label: "Excelente Nível", bg: "bg-emerald-100 text-emerald-900 border-emerald-300" },
    bom: { label: "Bom Nível", bg: "bg-sky-100 text-sky-900 border-sky-300" },
    atencao: { label: "Atenção Necessária", bg: "bg-amber-100 text-amber-900 border-amber-300" },
    critico: { label: "Necessita Revisão", bg: "bg-rose-100 text-rose-900 border-rose-300" }
  }[score.overallLevel];

  return (
    <div className="space-y-6">
      {/* Banner Principal com Score Geral e Resumo estilo Unicamp */}
      <div className="bg-linear-to-br from-[#0f2b48] via-[#164e87] to-[#0d3b66] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${levelBadge.bg}`}>
                {levelBadge.label}
              </span>
              <span className="text-xs text-sky-200 font-medium">Metodologia Oficial Unicamp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Diagnóstico de Linguagem Simples
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              {score.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {score.overallScore}
              </div>
              <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                Pontuação Geral
              </div>
            </div>
          </div>
        </div>

        {/* Barra de métricas rápidas no banner */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-sky-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-300" />
            <span><strong>{metrics.wordsCount ?? metrics.wordCount ?? 0}</strong> palavras</span>
          </div>
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-sky-300" />
            <span><strong>{metrics.sentencesCount ?? metrics.sentenceCount ?? 0}</strong> frases ({metrics.avgSentenceLengthWords ?? metrics.avgWordsPerSentence ?? 0} pal/frase)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span><strong>{metrics.longSentencesCount}</strong> frases longas (&gt; 20 pal.)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-300" />
            <span><strong>{Math.max(1, Math.round((metrics.readingTimeSeconds ?? 60) / 60))}</strong> min de leitura estimada</span>
          </div>
        </div>
      </div>

      {/* Os Três Pilares da Unicamp */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#164e87]" />
          <span>Os Três Pilares da Comunicação Clara</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard pillar={score.pillars.encontrar} />
          <PillarCard pillar={score.pillars.compreender} />
          <PillarCard pillar={score.pillars.usar} />
        </div>
      </div>

      {/* Grid das 8 Dimensões Avaliadas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-slate-500">
          Avaliação por Dimensão Linguística
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {score.dimensions.map(dim => {
            const levelColor = {
              excelente: "text-emerald-700 bg-emerald-50 border-emerald-200",
              bom: "text-sky-700 bg-sky-50 border-sky-200",
              atencao: "text-amber-700 bg-amber-50 border-amber-200",
              critico: "text-rose-700 bg-rose-50 border-rose-200"
            }[dim.level];

            return (
              <div key={dim.key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate pr-2">
                    {dim.label}
                  </span>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${levelColor}`}>
                    {dim.score}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {dim.description}
                </p>
                {dim.findingsCount > 0 && (
                  <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dim.findingsCount} apontamento(s)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
