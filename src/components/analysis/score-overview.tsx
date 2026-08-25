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
    excelente: { label: "Excelente Nível", bg: "bg-[#FBB040] text-black border-[#d98a1a]" },
    bom: { label: "Bom Nível", bg: "bg-zinc-800 text-[#FBB040] border-zinc-700" },
    atencao: { label: "Atenção Necessária", bg: "bg-zinc-800 text-amber-300 border-zinc-700" },
    critico: { label: "Necessita Revisão", bg: "bg-zinc-800 text-rose-300 border-zinc-700" }
  }[score.overallLevel];

  return (
    <div className="space-y-6">
      {/* Banner Principal com Score Geral em Preto, Carvão e Amarelo #FBB040 */}
      <div className="bg-[#18181b] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-black">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${levelBadge.bg}`}>
                {levelBadge.label}
              </span>
              <span className="text-xs text-zinc-400 font-bold">Metodologia Oficial Unicamp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Diagnóstico de Linguagem Simples
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed font-normal">
              {score.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/60 px-6 py-4 rounded-2xl border border-zinc-800 shadow-inner">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-[#FBB040] tracking-tight">
                {score.overallScore}
              </div>
              <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">
                Pontuação Geral
              </div>
            </div>
          </div>
        </div>

        {/* Barra de métricas rápidas no banner */}
        <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FBB040]" />
            <span><strong>{metrics.wordsCount ?? metrics.wordCount ?? 0}</strong> palavras</span>
          </div>
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-[#FBB040]" />
            <span><strong>{metrics.sentencesCount ?? metrics.sentenceCount ?? 0}</strong> frases ({metrics.avgSentenceLengthWords ?? metrics.avgWordsPerSentence ?? 0} pal/frase)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FBB040]" />
            <span><strong>{metrics.longSentencesCount}</strong> frases longas (&gt; 20 pal.)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FBB040]" />
            <span><strong>{Math.max(1, Math.round((metrics.readingTimeSeconds ?? 60) / 60))}</strong> min de leitura estimada</span>
          </div>
        </div>
      </div>

      {/* Os Três Pilares da Unicamp */}
      <div>
        <h3 className="text-base font-black text-[#18181b] mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FBB040]" />
          <span>Os Três Pilares da Comunicação Clara</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard pillar={score.pillars.encontrar} />
          <PillarCard pillar={score.pillars.compreender} />
          <PillarCard pillar={score.pillars.usar} />
        </div>
      </div>

      {/* Grid das Dimensões Avaliadas */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
        <h3 className="text-xs font-black text-black mb-4 uppercase tracking-wider">
          Avaliação por Dimensão Linguística
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {score.dimensions.map(dim => {
            return (
              <div key={dim.key} className="bg-[#faf9f5] border border-zinc-200 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-black text-zinc-900 truncate pr-2">
                    {dim.label}
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md border bg-white border-zinc-300 text-black">
                    {dim.score}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug line-clamp-2">
                  {dim.description}
                </p>
                {dim.findingsCount > 0 && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-zinc-800 bg-[#fef7eb] border border-[#FBB040] px-2 py-0.5 rounded-lg">
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
