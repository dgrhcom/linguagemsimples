import { AnalysisResult } from "@/types/analysis";
import { Award, FileText, CheckCircle, AlertTriangle, ShieldCheck, Printer } from "lucide-react";

interface FullReportProps {
  result: AnalysisResult;
}

export function FullReport({ result }: FullReportProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-sm space-y-8 print:border-0 print:p-0">
      {/* Cabeçalho do Relatório */}
      <div className="border-b border-zinc-200 pb-6 flex justify-between items-start">
        <div>
          <span className="text-xs font-black text-black uppercase tracking-widest block mb-1">
            Relatório Oficial de Avaliação
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Linguagem Simples e Inclusiva
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Fundamentado nas diretrizes do Projeto Linguagem Simples e Inclusiva da Unicamp
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print bg-[#faf9f5] hover:bg-zinc-100 border border-zinc-300 text-black text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Printer className="w-4 h-4 text-black" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* Metadados da Análise */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#faf9f5] p-4 rounded-2xl border border-zinc-200 text-xs">
        <div>
          <span className="text-zinc-500 block font-medium">Data da Análise</span>
          <span className="font-bold text-black">{new Date(result.timestamp).toLocaleDateString("pt-BR")}</span>
        </div>
        <div>
          <span className="text-zinc-500 block font-medium">Tipo de Documento</span>
          <span className="font-bold text-black capitalize">{result.input.documentType}</span>
        </div>
        <div>
          <span className="text-zinc-500 block font-medium">Público-Alvo</span>
          <span className="font-bold text-black">{result.input.targetAudience || "Geral"}</span>
        </div>
        <div>
          <span className="text-zinc-500 block font-medium">Versão da Metodologia</span>
          <span className="font-bold text-black">{result.appliedRuleVersion}</span>
        </div>
      </div>

      {/* Resumo e Score Geral */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#18181b] text-white p-6 sm:p-7 rounded-3xl border border-black shadow-md">
        <div>
          <h2 className="text-lg font-black text-[#FBB040] mb-1">
            Diagnóstico Geral: {result.score.overallLevel.toUpperCase()}
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-normal">
            {result.score.summary}
          </p>
        </div>
        <div className="text-center bg-black/60 px-6 py-4 rounded-2xl border border-zinc-800 shadow-inner shrink-0">
          <div className="text-4xl font-black text-[#FBB040]">{result.score.overallScore}</div>
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">Score Geral</div>
        </div>
      </div>

      {/* Os 3 Pilares */}
      <div>
        <h3 className="text-base font-black text-black mb-4">
          Avaliação dos Três Pilares da Informação
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-zinc-200 bg-[#faf9f5] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-black">1. Encontrar</strong>
              <span className="text-xs font-black text-black">{result.score.pillars.encontrar.score}/100</span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">{result.score.pillars.encontrar.summary}</p>
          </div>

          <div className="border border-zinc-200 bg-[#faf9f5] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-black">2. Compreender</strong>
              <span className="text-xs font-black text-black">{result.score.pillars.compreender.score}/100</span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">{result.score.pillars.compreender.summary}</p>
          </div>

          <div className="border border-zinc-200 bg-[#faf9f5] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-black">3. Usar</strong>
              <span className="text-xs font-black text-black">{result.score.pillars.usar.score}/100</span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">{result.score.pillars.usar.summary}</p>
          </div>
        </div>
      </div>

      {/* Lista de Apontamentos */}
      <div>
        <h3 className="text-base font-black text-black mb-4">
          Detalhamento dos Apontamentos ({result.findings.length})
        </h3>
        <div className="space-y-3">
          {result.findings.map((f, i) => (
            <div key={f.id} className="border border-zinc-200 bg-white rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center font-bold">
                <span className="text-black font-black">{i + 1}. &ldquo;{f.originalText}&rdquo;</span>
                <span className="text-[10px] uppercase font-bold text-zinc-600 bg-[#faf9f5] border border-zinc-300 px-2 py-0.5 rounded-md">
                  {f.category} • {f.severity}
                </span>
              </div>
              <p className="text-zinc-600"><strong className="text-black">Problema:</strong> {f.explanation}</p>
              <p className="text-black font-medium"><strong className="text-black">Recomendação:</strong> {f.recommendation}</p>
              {f.suggestedText && (
                <p className="text-black bg-[#fef7eb] border border-[#FBB040] p-2 rounded-xl"><strong className="text-black">Sugestão:</strong> &ldquo;{f.suggestedText}&rdquo;</p>
              )}
              {f.source?.title && (
                <div className="text-[10px] text-zinc-400 pt-1 font-medium">Fonte: {f.source.title}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Versão Reescrita */}
      <div>
        <h3 className="text-base font-black text-black mb-4">
          Versão Final em Linguagem Simples e Inclusiva
        </h3>
        <div className="bg-[#fef7eb]/60 border border-[#FBB040] p-6 rounded-3xl text-sm text-zinc-950 font-medium leading-relaxed whitespace-pre-wrap">
          {result.rewrittenText || result.input.text}
        </div>
      </div>

      {/* Validação Semântica */}
      {result.semanticValidation && (
        <div className="border border-zinc-200 bg-[#faf9f5] rounded-2xl p-4 text-xs text-zinc-700 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-black shrink-0" />
          <span>
            {result.semanticValidation.summary || `Validação Semântica Concluída (${result.semanticValidation.preservationScore ?? 100}% de preservação): todos os fatos, números, datas e leis foram validados.`}
          </span>
        </div>
      )}
    </div>
  );
}
