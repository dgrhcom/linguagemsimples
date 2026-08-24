import { AnalysisResult } from "@/types/analysis";
import { Award, FileText, CheckCircle, AlertTriangle, ShieldCheck, Printer } from "lucide-react";

interface FullReportProps {
  result: AnalysisResult;
}

export function FullReport({ result }: FullReportProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 print:border-0 print:p-0">
      {/* Cabeçalho do Relatório */}
      <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
            Relatório de Avaliação
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Linguagem Simples e Inclusiva
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fundamentado nas diretrizes do Projeto Linguagem Simples e Inclusiva da Unicamp
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* Metadados da Análise */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Data da Análise</span>
          <span className="font-semibold text-slate-800">{new Date(result.timestamp).toLocaleDateString("pt-BR")}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Tipo de Documento</span>
          <span className="font-semibold text-slate-800 capitalize">{result.input.documentType}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Público-Alvo</span>
          <span className="font-semibold text-slate-800">{result.input.targetAudience || "Geral"}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Versão da Metodologia</span>
          <span className="font-semibold text-slate-800">{result.appliedRuleVersion}</span>
        </div>
      </div>

      {/* Resumo e Score Geral */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <div>
          <h2 className="text-lg font-bold text-blue-950 mb-1">
            Diagnóstico Geral: {result.score.overallLevel.toUpperCase()}
          </h2>
          <p className="text-xs text-blue-900 leading-relaxed">
            {result.score.summary}
          </p>
        </div>
        <div className="text-center bg-white px-6 py-4 rounded-2xl border border-blue-200 shadow-xs shrink-0">
          <div className="text-4xl font-black text-blue-700">{result.score.overallScore}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Geral</div>
        </div>
      </div>

      {/* Os 3 Pilares */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Avaliação dos Três Pilares da Informação
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-slate-900">1. Encontrar</strong>
              <span className="text-xs font-bold text-blue-600">{result.score.pillars.encontrar.score}/100</span>
            </div>
            <p className="text-xs text-slate-600">{result.score.pillars.encontrar.summary}</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-slate-900">2. Compreender</strong>
              <span className="text-xs font-bold text-blue-600">{result.score.pillars.compreender.score}/100</span>
            </div>
            <p className="text-xs text-slate-600">{result.score.pillars.compreender.summary}</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-xs text-slate-900">3. Usar</strong>
              <span className="text-xs font-bold text-blue-600">{result.score.pillars.usar.score}/100</span>
            </div>
            <p className="text-xs text-slate-600">{result.score.pillars.usar.summary}</p>
          </div>
        </div>
      </div>

      {/* Problemas Encontrados */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Apontamentos e Oportunidades de Melhoria ({result.findings.length})
        </h3>
        <div className="space-y-3">
          {result.findings.map((f, i) => (
            <div key={f.id} className="border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">
                  {i + 1}. &ldquo;{f.originalText}&rdquo;
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  {f.category} • {f.severity}
                </span>
              </div>
              <p className="text-slate-600"><strong className="text-slate-700">Problema:</strong> {f.explanation}</p>
              <p className="text-emerald-800 font-medium"><strong className="text-emerald-900">Recomendação:</strong> {f.recommendation}</p>
              {f.suggestedText && (
                <p className="text-blue-800"><strong className="text-blue-900">Sugestão:</strong> &ldquo;{f.suggestedText}&rdquo;</p>
              )}
              <div className="text-[10px] text-slate-400 pt-1">Fonte: {f.source.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Versão Reescrita */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Versão Final em Linguagem Simples e Inclusiva
        </h3>
        <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
          {result.rewrittenText || result.input.text}
        </div>
      </div>

      {/* Validação Semântica */}
      {result.semanticValidation && (
        <div className="border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Validação Semântica Concluída ({result.semanticValidation.preservationScore}% de preservação): todos os fatos, números, datas e leis foram validados.
          </span>
        </div>
      )}
    </div>
  );
}
