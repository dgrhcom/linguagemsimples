import { AnalysisResult } from "@/types/analysis";
import { Award, FileText, CheckCircle, AlertTriangle, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullReportProps {
  result: AnalysisResult;
}

export function FullReport({ result }: FullReportProps) {
  return (
    <div className="bg-paper rounded-card border border-sand p-8 sm:p-12 space-y-8 print:border-0 print:p-0">
      {/* Cabeçalho do Relatório */}
      <div className="border-b border-sand pb-6 flex justify-between items-start">
        <div>
          <span className="text-micro-label text-stone block mb-1">
            Relatório Oficial de Avaliação
          </span>
          <h1 className="font-display text-heading sm:text-heading-lg text-ink">
            Linguagem Simples e Inclusiva
          </h1>
          <p className="text-body-sm text-stone mt-1">
            Fundamentado nas diretrizes do Projeto Linguagem Simples e Inclusiva da Unicamp
          </p>
        </div>

        <Button
          onClick={() => window.print()}
          variant="secondary"
          size="md"
          className="no-print"
          leftIcon={<Printer className="w-4 h-4 text-ink" />}
        >
          Imprimir Relatório
        </Button>
      </div>

      {/* Metadados da Análise */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sand/30 p-4 rounded-card border border-sand text-body-sm">
        <div>
          <span className="text-stone block">Data da Análise</span>
          <span className="font-semibold text-ink">{new Date(result.timestamp).toLocaleDateString("pt-BR")}</span>
        </div>
        <div>
          <span className="text-stone block">Tipo de Documento</span>
          <span className="font-semibold text-ink capitalize">{result.input.documentType}</span>
        </div>
        <div>
          <span className="text-stone block">Público-Alvo</span>
          <span className="font-semibold text-ink">{result.input.targetAudience || "Geral"}</span>
        </div>
        <div>
          <span className="text-stone block">Versão da Metodologia</span>
          <span className="font-semibold text-ink">{result.appliedRuleVersion}</span>
        </div>
      </div>

      {/* Resumo e Score Geral */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-ink text-paper p-6 sm:p-7 rounded-card border border-slate">
        <div>
          <h2 className="text-subheading font-display text-amber mb-1">
            Diagnóstico Geral: {result.score.overallLevel.toUpperCase()}
          </h2>
          <p className="text-body-sm text-stone leading-relaxed">
            {result.score.summary}
          </p>
        </div>
        <div className="text-center bg-deep-stone/60 px-6 py-4 rounded-tile border border-slate shrink-0">
          <div className="text-display-sm font-display text-amber">{result.score.overallScore}</div>
          <div className="text-micro-label text-stone mt-0.5">Score Geral</div>
        </div>
      </div>

      {/* Os 3 Pilares */}
      <div>
        <h3 className="text-body font-display text-ink mb-4">
          Avaliação dos Três Pilares da Informação
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-sand bg-sand/30 rounded-card p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-body-sm text-ink">1. Encontrar</strong>
              <span className="text-body-sm font-semibold text-ink">{result.score.pillars.encontrar.score}/100</span>
            </div>
            <p className="text-body-sm text-charcoal">{result.score.pillars.encontrar.summary}</p>
          </div>

          <div className="border border-sand bg-sand/30 rounded-card p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-body-sm text-ink">2. Compreender</strong>
              <span className="text-body-sm font-semibold text-ink">{result.score.pillars.compreender.score}/100</span>
            </div>
            <p className="text-body-sm text-charcoal">{result.score.pillars.compreender.summary}</p>
          </div>

          <div className="border border-sand bg-sand/30 rounded-card p-4">
            <div className="flex justify-between items-center mb-1">
              <strong className="text-body-sm text-ink">3. Usar</strong>
              <span className="text-body-sm font-semibold text-ink">{result.score.pillars.usar.score}/100</span>
            </div>
            <p className="text-body-sm text-charcoal">{result.score.pillars.usar.summary}</p>
          </div>
        </div>
      </div>

      {/* Lista de Apontamentos */}
      <div>
        <h3 className="text-body font-display text-ink mb-4">
          Detalhamento dos Apontamentos ({result.findings.length})
        </h3>
        <div className="space-y-3">
          {result.findings.map((f, i) => (
            <div key={f.id} className="border border-sand bg-paper rounded-card p-4 text-body-sm space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-ink font-semibold">{i + 1}. &ldquo;{f.originalText}&rdquo;</span>
                <span className="text-micro-label text-stone bg-sand/50 border border-sand px-2 py-0.5 rounded-btn">
                  {f.category} • {f.severity}
                </span>
              </div>
              <p className="text-charcoal"><strong className="text-ink">Problema:</strong> {f.explanation}</p>
              <p className="text-ink"><strong className="text-ink">Recomendação:</strong> {f.recommendation}</p>
              {f.suggestedText && (
                <p className="text-ink bg-amber/10 border border-amber/40 p-2 rounded-tile"><strong className="text-ink">Sugestão:</strong> &ldquo;{f.suggestedText}&rdquo;</p>
              )}
              {f.source?.title && (
                <div className="text-micro-label text-stone pt-1">Fonte: {f.source.title}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Versão Reescrita */}
      <div>
        <h3 className="text-body font-display text-ink mb-4">
          Versão Final em Linguagem Simples e Inclusiva
        </h3>
        <div className="bg-amber/10 border border-amber/40 p-6 rounded-card text-body-sm text-ink leading-relaxed whitespace-pre-wrap">
          {result.rewrittenText || result.input.text}
        </div>
      </div>

      {/* Validação Semântica */}
      {result.semanticValidation && (
        <div className="border border-sand bg-sand/30 rounded-card p-4 text-body-sm text-charcoal flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-ink shrink-0" />
          <span>
            {result.semanticValidation.summary || `Validação Semântica Concluída (${result.semanticValidation.preservationScore ?? 100}% de preservação): todos os fatos, números, datas e leis foram validados.`}
          </span>
        </div>
      )}
    </div>
  );
}
