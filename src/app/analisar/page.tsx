"use client";

import { useState, useEffect } from "react";
import { TextEditor } from "@/components/editor/text-editor";
import { ScoreOverview } from "@/components/analysis/score-overview";
import { AnnotatedText } from "@/components/findings/annotated-text";
import { FindingsList } from "@/components/findings/findings-list";
import { ComparisonView } from "@/components/comparison/comparison-view";
import { FullReport } from "@/components/report/full-report";
import { ExportModal } from "@/components/export/export-modal";
import { SettingsModal } from "@/components/layout/settings-modal";
import { AnalysisInput, AnalysisResult, Finding } from "@/types/analysis";
import {
  LayoutDashboard,
  CheckSquare,
  GitCompare,
  FileText,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Wand2,
  Cpu,
  Settings
} from "lucide-react";

export default function AnalisarPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "comparison" | "report">("overview");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiProviderName, setAiProviderName] = useState<string>("Motor Unicamp (Offline)");

  const updateAiProviderDisplay = () => {
    try {
      const provider = localStorage.getItem("preferred_ai_provider") || "offline";
      const geminiKey = localStorage.getItem("custom_gemini_api_key");
      const openaiKey = localStorage.getItem("custom_openai_api_key");

      if (provider === "gemini" && geminiKey) {
        setAiProviderName("Google Gemini (Online)");
      } else if (provider === "openai" && openaiKey) {
        setAiProviderName("OpenAI GPT (Online)");
      } else {
        setAiProviderName("Motor Unicamp (Offline)");
      }
    } catch (e) {
      setAiProviderName("Motor Unicamp (Offline)");
    }
  };

  useEffect(() => {
    updateAiProviderDisplay();

    // Carrega exemplo se veio da home ou de exemplos
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

  const getAiHeaders = (): Record<string, string> => {
    try {
      const provider = localStorage.getItem("preferred_ai_provider") || "offline";
      if (provider === "gemini") {
        const key = localStorage.getItem("custom_gemini_api_key");
        if (key) return { "x-ai-provider": "gemini", "x-ai-api-key": key };
      } else if (provider === "openai") {
        const key = localStorage.getItem("custom_openai_api_key");
        if (key) return { "x-ai-provider": "openai", "x-ai-api-key": key };
      }
    } catch (e) {}
    return {};
  };

  const handleAnalyze = async (input: AnalysisInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAiHeaders()
        },
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

    showToast("Versão integral em Linguagem Simples aplicada ao texto de trabalho!");
  };

  const handleResetAnalysis = () => {
    setResult(null);
    setSelectedFinding(null);
    setActiveTab("overview");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast de Notificação */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#164e87] text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-400 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Se não houver resultado, exibe o Editor */}
      {!result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-[#1c2d42] tracking-tight">
                Avaliação de Texto em Linguagem Simples
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Cole sua mensagem, ofício ou relatório para receber diagnóstico multidimensional e propostas de simplificação.
              </p>
            </div>

            {/* Status do Provedor de IA */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all shadow-2xs"
              title="Configurar Chaves de API de IA"
            >
              <Cpu className="w-3.5 h-3.5 text-[#005a87]" />
              <span>{aiProviderName}</span>
              <Settings className="w-3 h-3 text-slate-400 ml-1" />
            </button>
          </div>

          <TextEditor onAnalyze={handleAnalyze} isLoading={loading} />
        </div>
      )}

      {/* Se houver resultado, exibe o Painel de Análise e Revisão */}
      {result && (
        <div className="space-y-6">
          {/* Barra Superior de Ações e Abas */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetAnalysis}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                title="Voltar ao editor e analisar novo texto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nova Análise</span>
              </button>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              {/* Status do Provedor */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200"
              >
                <Cpu className="w-3.5 h-3.5 text-[#005a87]" />
                <span>{aiProviderName}</span>
              </button>
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

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                      <AnnotatedText
                        text={result.workingText || result.input.text}
                        findings={result.findings}
                        selectedFinding={selectedFinding}
                        onSelectFinding={setSelectedFinding}
                      />
                    </div>
                    <div className="lg:col-span-6">
                      <FindingsList
                        findings={result.findings.slice(0, 5)}
                        targetAudience={result.input.targetAudience}
                        documentType={result.input.documentType}
                        selectedFinding={selectedFinding}
                        onSelectFinding={setSelectedFinding}
                        onApplySuggestion={handleApplySuggestion}
                        onRevertSuggestion={handleRevertSuggestion}
                        onIgnoreFinding={handleIgnoreFinding}
                        onUpdateFindingSuggestion={handleUpdateFindingSuggestion}
                        onApplyAllSuggestions={handleApplyAllSuggestions}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "findings" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className="sticky top-28">
                  <AnnotatedText
                    text={result.workingText || result.input.text}
                    findings={result.findings}
                    selectedFinding={selectedFinding}
                    onSelectFinding={setSelectedFinding}
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <FindingsList
                  findings={result.findings}
                  targetAudience={result.input.targetAudience}
                  documentType={result.input.documentType}
                  selectedFinding={selectedFinding}
                  onSelectFinding={setSelectedFinding}
                  onApplySuggestion={handleApplySuggestion}
                  onRevertSuggestion={handleRevertSuggestion}
                  onIgnoreFinding={handleIgnoreFinding}
                  onUpdateFindingSuggestion={handleUpdateFindingSuggestion}
                  onApplyAllSuggestions={handleApplyAllSuggestions}
                />
              </div>
            </div>
          )}

          {activeTab === "comparison" && (
            <ComparisonView
              originalText={result.input.text}
              workingText={result.workingText || result.input.text}
              rewrittenText={result.rewrittenText || result.input.text}
              onApplyRewritten={() => {
                setResult({
                  ...result,
                  workingText: result.rewrittenText,
                  findings: result.findings.map(f => ({ ...f, status: "applied" as const }))
                });
                showToast("Versão Simplificada aplicada ao texto de trabalho!");
              }}
            />
          )}

          {activeTab === "report" && (
            <FullReport result={result} />
          )}

          {/* Modal de Exportação */}
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            result={result}
          />

          {/* Modal de Configurações de IA */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => {
              setIsSettingsOpen(false);
              updateAiProviderDisplay();
            }}
            onSaved={updateAiProviderDisplay}
          />
        </div>
      )}
    </div>
  );
}
