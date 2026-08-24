"use client";

import { useState, useEffect } from "react";
import { TextEditor } from "@/components/editor/text-editor";
import { ScoreOverview } from "@/components/analysis/score-overview";
import { AnnotatedText } from "@/components/findings/annotated-text";
import { FindingsList } from "@/components/findings/findings-list";
import { ComparisonView } from "@/components/comparison/comparison-view";
import { FullReport } from "@/components/report/full-report";
import { ExportModal } from "@/components/export/export-modal";
import { AnalysisInput, AnalysisResult, Finding } from "@/types/analysis";
import { Sparkles, LayoutDashboard, CheckSquare, GitCompare, FileText, Download, ArrowLeft, CheckCircle2, Wand2 } from "lucide-react";

export default function AnalisarPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullRewriting, setFullRewriting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "comparison" | "report">("overview");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = sessionStorage.getItem("pending_analysis");
      if (pending) {
        sessionStorage.removeItem("pending_analysis");
        try {
          const parsed = JSON.parse(pending);
          handleAnalyze(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleAnalyze = async (input: AnalysisInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar a análise do texto.");
      }

      const data: AnalysisResult = await response.json();
      const findingsWithStatus: Finding[] = (data.findings || []).map(f => ({
        ...f,
        status: "pending" as const
      }));

      setResult({
        ...data,
        workingText: data.input.text,
        findings: findingsWithStatus
      });
      setActiveTab("overview");
      setSelectedFinding(null);
    } catch (error: any) {
      alert(error.message || "Ocorreu um erro ao analisar o texto.");
    } finally {
      setLoading(false);
    }
  };

  // Aceitar sugestão individual
  const handleApplySuggestion = (finding: Finding) => {
    if (!result || !finding.suggestedText) return;

    const currentWorking = result.workingText || result.input.text;
    const updatedWorking = currentWorking.replace(finding.originalText, finding.suggestedText);

    const updatedFindings = result.findings.map(f =>
      f.id === finding.id ? { ...f, status: "applied" as const } : f
    );

    setResult({
      ...result,
      workingText: updatedWorking,
      findings: updatedFindings
    });

    showToast(`Alteração aplicada: "${finding.originalText}" → "${finding.suggestedText}"`);
  };

  // Atualizar sugestão gerada pela IA para um finding
  const handleUpdateFindingSuggestion = (finding: Finding, newSuggestion: string) => {
    if (!result) return;

    const updatedFindings = result.findings.map(f =>
      f.id === finding.id ? { ...f, suggestedText: newSuggestion } : f
    );

    setResult({
      ...result,
      findings: updatedFindings
    });

    showToast(`Nova sugestão gerada pela IA para o trecho selecionado!`);
  };

  // Reverter sugestão aplicada
  const handleRevertSuggestion = (finding: Finding) => {
    if (!result || !finding.suggestedText) return;

    const currentWorking = result.workingText || result.input.text;
    const updatedWorking = currentWorking.replace(finding.suggestedText, finding.originalText);

    const updatedFindings = result.findings.map(f =>
      f.id === finding.id ? { ...f, status: "pending" as const } : f
    );

    setResult({
      ...result,
      workingText: updatedWorking,
      findings: updatedFindings
    });

    showToast(`Alteração revertida para: "${finding.originalText}"`);
  };

  // Ignorar apontamento
  const handleIgnoreFinding = (finding: Finding) => {
    if (!result) return;

    const currentStatus = finding.status;
    const nextStatus = currentStatus === "ignored" ? ("pending" as const) : ("ignored" as const);

    const updatedFindings = result.findings.map(f =>
      f.id === finding.id ? { ...f, status: nextStatus } : f
    );

    setResult({
      ...result,
      findings: updatedFindings
    });
  };

  // Aceitar todas as sugestões pendentes em lote
  const handleApplyAllSuggestions = () => {
    if (!result) return;

    let updatedWorking = result.workingText || result.input.text;
    let appliedCount = 0;

    const updatedFindings = result.findings.map(f => {
      if ((!f.status || f.status === "pending") && f.suggestedText) {
        updatedWorking = updatedWorking.replace(f.originalText, f.suggestedText);
        appliedCount++;
        return { ...f, status: "applied" as const };
      }
      return f;
    });

    setResult({
      ...result,
      workingText: updatedWorking,
      findings: updatedFindings
    });

    showToast(`${appliedCount} sugestões foram aplicadas com sucesso no texto!`);
  };

  // Aplicar reescrita integral gerada por IA
  const handleApplyFullAiRewrite = () => {
    if (!result || !result.rewrittenText) return;

    setResult({
      ...result,
      workingText: result.rewrittenText,
      findings: result.findings.map(f => ({ ...f, status: "applied" as const }))
    });

    setActiveTab("comparison");
    showToast("Versão reescrita integralmente por IA aplicada ao texto de trabalho!");
  };

  const handleReset = () => {
    setResult(null);
    setSelectedFinding(null);
  };

  const appliedCount = result?.findings.filter(f => f.status === "applied").length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Notificação Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#164e87] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-blue-400 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {!result ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Avalie e Simplifique seu Texto
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Descubra se sua comunicação está clara, inclusiva e fácil de entender segundo os critérios do projeto Linguagem Simples da Unicamp.
            </p>
          </div>

          <TextEditor onAnalyze={handleAnalyze} isLoading={loading} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Barra de Ações Superior do Painel de Análise */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Nova Análise</span>
              </button>

              <div className="text-xs text-slate-500 hidden sm:block">
                Documento: <strong className="text-slate-800 capitalize">{result.input.documentType}</strong> • {result.metrics.wordCount} palavras
                {appliedCount > 0 && (
                  <span className="ml-2 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {appliedCount} alteração(ões) aceita(s)
                  </span>
                )}
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === "overview" ? "bg-white text-[#005a87] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Visão Geral</span>
              </button>

              <button
                onClick={() => setActiveTab("findings")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === "findings" ? "bg-white text-[#005a87] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Problemas ({result.findings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("comparison")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === "comparison" ? "bg-white text-[#005a87] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparação (Estilo WordPress)</span>
              </button>

              <button
                onClick={() => setActiveTab("report")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === "report" ? "bg-white text-[#005a87] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Relatório</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {result.rewrittenText && (
                <button
                  onClick={handleApplyFullAiRewrite}
                  className="text-xs font-bold bg-[#005a87] hover:bg-[#00476b] text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Substituir o texto original pela proposta integral reescrita pela IA"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Aplicar Reescrita IA</span>
                </button>
              )}

              <button
                onClick={() => setIsExportOpen(true)}
                className="text-xs font-bold bg-[#c2383f] hover:bg-[#a7282e] text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Conteúdo Dinâmico da Aba Ativa */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <ScoreOverview score={result.score} metrics={result.metrics} />
              
              {result.findings.length > 0 && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-900">
                      Principais Oportunidades de Melhoria
                    </h3>
                    <button
                      onClick={() => setActiveTab("findings")}
                      className="text-xs text-[#005a87] font-semibold hover:underline"
                    >
                      Ver todos os {result.findings.length} apontamentos →
                    </button>
                  </div>
                  <FindingsList
                    findings={result.findings.slice(0, 3)}
                    targetAudience={result.input.targetAudience}
                    documentType={result.input.documentType}
                    onApplySuggestion={handleApplySuggestion}
                    onRevertSuggestion={handleRevertSuggestion}
                    onIgnoreFinding={handleIgnoreFinding}
                    onUpdateFindingSuggestion={handleUpdateFindingSuggestion}
                    onSelectFinding={setSelectedFinding}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "findings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Texto com Marcações Interativas
                </div>
                <AnnotatedText
                  text={result.workingText || result.input.text}
                  findings={result.findings.filter(f => f.status !== "applied")}
                  selectedFindingId={selectedFinding?.id}
                  onSelectFinding={setSelectedFinding}
                />
              </div>

              <div className="lg:col-span-6 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Apontamentos e Sugestões da Metodologia
                </div>
                <FindingsList
                  findings={result.findings}
                  targetAudience={result.input.targetAudience}
                  documentType={result.input.documentType}
                  onApplySuggestion={handleApplySuggestion}
                  onRevertSuggestion={handleRevertSuggestion}
                  onIgnoreFinding={handleIgnoreFinding}
                  onUpdateFindingSuggestion={handleUpdateFindingSuggestion}
                  onApplyAllSuggestions={handleApplyAllSuggestions}
                  selectedFindingId={selectedFinding?.id}
                  onSelectFinding={setSelectedFinding}
                />
              </div>
            </div>
          )}

          {activeTab === "comparison" && (
            <ComparisonView
              originalText={result.input.text}
              workingText={result.workingText || result.input.text}
              rewrittenText={result.rewrittenText || result.input.text}
              semanticValidation={result.semanticValidation}
            />
          )}

          {activeTab === "report" && (
            <FullReport result={result} />
          )}

          {/* Modal de Exportação */}
          <ExportModal
            result={{
              ...result,
              rewrittenText: result.workingText || result.rewrittenText || result.input.text
            }}
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
