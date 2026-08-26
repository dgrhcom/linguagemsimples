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
import { DynamicDocumentDrawer } from "@/components/templates/dynamic-document-drawer";
import { AnalysisInput, AnalysisResult, Finding } from "@/types/analysis";

import { getStoredAiHeaders } from "@/lib/ai";
import documentTypesData from "@/data/document-types/document-types.json";


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

import { safeStorage } from "@/lib/storage";

export default function AnalisarPage() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
	const [activeTab, setActiveTab] = useState<"overview" | "findings" | "comparison" | "report">("overview");
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const [aiProviderName, setAiProviderName] = useState<string>("Motor Unicamp (Offline)");

	const updateAiProviderDisplay = () => {
		try {
			const provider = safeStorage.getItem("preferred_ai_provider") || "offline";
			const geminiKey = safeStorage.getItem("custom_gemini_api_key");
			const openaiKey = safeStorage.getItem("custom_openai_api_key");

			if (provider === "gemini" && geminiKey && geminiKey.trim()) {
				setAiProviderName("Google Gemini (Online)");
			} else if (provider === "openai" && openaiKey && openaiKey.trim()) {
				setAiProviderName("OpenAI GPT (Online)");
			} else if (geminiKey && geminiKey.trim() && provider !== "offline") {
				setAiProviderName("Google Gemini (Online)");
			} else {
				setAiProviderName("Motor Unicamp (Offline)");
			}
		} catch (e) {
			setAiProviderName("Motor Unicamp (Offline)");
		}
	};


	useEffect(() => {
		updateAiProviderDisplay();

		const handleOpenSettings = () => setIsSettingsOpen(true);
		window.addEventListener("open-ai-settings", handleOpenSettings);

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

		return () => {
			window.removeEventListener("open-ai-settings", handleOpenSettings);
		};
	}, []);


	const handleAnalyze = async (input: AnalysisInput) => {
		setLoading(true);
		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...getStoredAiHeaders()
				},
				body: JSON.stringify(input)
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.error || errData.message || "Erro ao realizar a análise do texto.");
			}

			const data: AnalysisResult = await response.json();
			data.workingText = data.input.text;
			setResult(data);
			setActiveTab("overview");
			setSelectedFinding(null);
			showToast("Texto analisado com sucesso!");
		} catch (error: any) {
			console.error("Erro na análise:", error);
			alert(error.message || "Houve um erro ao processar o texto. Tente novamente.");
		} finally {
			setLoading(false);
		}
	};


	const showToast = (msg: string) => {
		setToastMessage(msg);
		setTimeout(() => {
			setToastMessage(null);
		}, 3000);
	};

	const handleApplySuggestion = (finding: Finding) => {
		if (!result || !finding.suggestedText || finding.suggestedText.trim() === finding.originalText.trim()) return;

		const currentText = result.workingText || result.input.text;
		let updatedText = currentText;

		if (currentText.includes(finding.originalText)) {
			updatedText = currentText.replace(finding.originalText, finding.suggestedText);
		} else {
			// Tenta correspondência flexível para sentenças que já tiveram pequenas alterações internas
			const origWords = finding.originalText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
			const paragraphs = currentText.split(/\n/);
			let replaced = false;

			const newParagraphs = paragraphs.map(p => {
				if (replaced) return p;
				const pWords = p.toLowerCase().split(/\s+/);
				const matches = origWords.filter(w => pWords.includes(w)).length;
				if (origWords.length > 0 && matches / origWords.length >= 0.6) {
					replaced = true;
					return finding.suggestedText!;
				}
				return p;
			});

			if (replaced) {
				updatedText = newParagraphs.join("\n");
			} else {
				showToast("O trecho original já foi modificado em uma revisão anterior.");
				return;
			}
		}

		const updatedFindings = result.findings.map(f => {
			if (f.id === finding.id) {
				return { ...f, status: "applied" as const };
			}
			// Se o finding for uma frase e contiver outro finding menor, marca como applied também
			if (finding.category === "sentence" && finding.originalText.includes(f.originalText)) {
				return { ...f, status: "applied" as const };
			}
			return f;
		});

		setResult({
			...result,
			workingText: updatedText,
			findings: updatedFindings
		});

		showToast(`Sugestão aplicada com sucesso!`);
	};

	const handleRevertSuggestion = (finding: Finding) => {
		if (!result || !finding.suggestedText) return;

		const currentText = result.workingText || result.input.text;
		if (!currentText.includes(finding.suggestedText)) {
			showToast("Não foi possível reverter automaticamente.");
			return;
		}

		const updatedText = currentText.replace(finding.suggestedText, finding.originalText);

		const updatedFindings = result.findings.map(f => {
			if (f.id === finding.id) {
				return { ...f, status: "pending" as const };
			}
			return f;
		});

		setResult({
			...result,
			workingText: updatedText,
			findings: updatedFindings
		});

		showToast(`Alteração revertida para o original!`);
	};

	const handleIgnoreFinding = (finding: Finding) => {
		if (!result) return;

		const isCurrentlyIgnored = finding.status === "ignored";
		const nextStatus = isCurrentlyIgnored ? ("pending" as const) : ("ignored" as const);

		const updatedFindings = result.findings.map(f => {
			if (f.id === finding.id) {
				return { ...f, status: nextStatus };
			}
			return f;
		});

		setResult({
			...result,
			findings: updatedFindings
		});

		showToast(isCurrentlyIgnored ? "Apontamento reativado." : "Apontamento ignorado.");
	};

	const handleUpdateFindingSuggestion = (finding: Finding, newSuggestion: string) => {
		if (!result) return;

		const updatedFindings = result.findings.map(f => {
			if (f.id === finding.id) {
				return { ...f, suggestedText: newSuggestion };
			}
			return f;
		});

		setResult({
			...result,
			findings: updatedFindings
		});

		showToast("Sugestão de reescrita atualizada!");
	};

	const handleApplyAllSuggestions = () => {
		if (!result) return;

		let currentText = result.workingText || result.input.text;
		let appliedCount = 0;

		// 1. Processa primeiro as frases longas (maiores estruturas)
		const sentenceFindings = result.findings.filter(
			f => (!f.status || f.status === "pending") && f.category === "sentence" && f.suggestedText && f.suggestedText.trim() !== f.originalText.trim()
		);

		const otherFindings = result.findings.filter(
			f => (!f.status || f.status === "pending") && f.category !== "sentence" && f.suggestedText && f.suggestedText.trim() !== f.originalText.trim()
		);

		const appliedIds = new Set<string>();

		// Aplica sentenças primeiro
		for (const f of sentenceFindings) {
			if (currentText.includes(f.originalText)) {
				currentText = currentText.replace(f.originalText, f.suggestedText!);
				appliedCount++;
				appliedIds.add(f.id);

				// Marca sub-achados contidos nesta frase como aplicados
				for (const of_ of otherFindings) {
					if (f.originalText.includes(of_.originalText)) {
						appliedIds.add(of_.id);
						appliedCount++;
					}
				}
			}
		}

		// Aplica os demais achados que ainda estão no texto
		for (const f of otherFindings) {
			if (!appliedIds.has(f.id) && currentText.includes(f.originalText)) {
				currentText = currentText.replace(f.originalText, f.suggestedText!);
				appliedCount++;
				appliedIds.add(f.id);
			}
		}

		// Fallback: se por diferenças de quebra de linha nenhum foi substituído, aplica a reescrita integral da IA
		if (appliedCount === 0 && result.rewrittenText && result.rewrittenText !== result.input.text) {
			currentText = result.rewrittenText;
			appliedCount = result.findings.length;
			result.findings.forEach(f => appliedIds.add(f.id));
		}

		const updatedFindings = result.findings.map(f => {
			if (appliedIds.has(f.id)) {
				return { ...f, status: "applied" as const };
			}
			return f;
		});

		setResult({
			...result,
			workingText: currentText,
			findings: updatedFindings
		});

		showToast(`${appliedCount} sugestões aceitas e aplicadas no texto com sucesso!`);
	};


	const handleApplyFullAiRewrite = () => {
		if (!result || !result.rewrittenText) return;

		const rewritten = result.rewrittenText;
		const updatedFindings = result.findings.map(f => {
			const isModified = rewritten ? !rewritten.includes(f.originalText) : false;
			return {
				...f,
				status: isModified ? ("applied" as const) : f.status
			};
		});


		setResult({
			...result,
			workingText: result.rewrittenText,
			findings: updatedFindings
		});

		showToast("Versão integral reescrita pela IA aplicada com sucesso!");
	};


	const handleUpdateWorkingText = (newText: string) => {
		if (!result) return;
		setResult({
			...result,
			workingText: newText
		});
		showToast("Texto do documento atualizado!");
	};

	const handleReanalyze = async (customText?: string) => {
		const textToAnalyze = (typeof customText === "string" ? customText : (result?.workingText || result?.input.text || "")).trim();
		if (!textToAnalyze) return;

		await handleAnalyze({
			text: textToAnalyze,
			documentType: result?.input.documentType || "general",
			targetAudience: result?.input.targetAudience,
			textGoal: result?.input.textGoal
		});
	};

	const [draftInitialText, setDraftInitialText] = useState("");

	const handleResetAnalysis = () => {
		setDraftInitialText("");
		setResult(null);
		setSelectedFinding(null);
	};


	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			{/* Toast Notification */}
			{toastMessage && (
				<div className="fixed bottom-6 right-6 z-50 bg-[#18181b] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-zinc-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
					<CheckCircle2 className="w-5 h-5 text-[#FBB040] shrink-0" />
					<span className="text-xs font-bold">{toastMessage}</span>
				</div>
			)}

			{/* Se não houver resultado, exibe o Editor */}
			{!result && (
				<div className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
						<div>
							<h1 className="text-2xl font-black text-black tracking-tight">
								Avaliação de Texto em Linguagem Simples
							</h1>
							<p className="text-xs text-zinc-600 mt-1 font-medium">
								Cole sua mensagem, ofício ou relatório para receber diagnóstico multidimensional e propostas de simplificação.
							</p>
						</div>

						{/* Status do Provedor de IA */}
						<button
							onClick={() => setIsSettingsOpen(true)}
							className="self-start sm:self-auto text-xs font-bold px-3.5 py-2 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-black flex items-center gap-2 transition-all shadow-2xs"
							title="Configurar Chaves de API de IA"
						>
							<Cpu className="w-3.5 h-3.5 text-[#FBB040]" />
							<span>{aiProviderName}</span>
							<Settings className="w-3 h-3 text-zinc-400 ml-1" />
						</button>
					</div>

					<TextEditor onAnalyze={handleAnalyze} isLoading={loading} initialText={draftInitialText} />
				</div>
			)}

			{/* Se houver resultado, exibe o Painel de Análise e Revisão */}
			{result && (
				<div className="space-y-6">
					{/* Barra Superior de Ações e Abas */}
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs">
						<div className="flex items-center gap-2">
							<button
								onClick={handleResetAnalysis}
								className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
								title="Voltar ao editor completo"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								<span>Nova Análise</span>
							</button>

							<button
								onClick={() => handleReanalyze()}
								disabled={loading}
								className="text-xs font-bold text-zinc-800 hover:text-black flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
								title="Reanalisar o texto com todas as edições e alterações atuais"
							>
								<RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#d98a1a]" : "text-[#d98a1a]"}`} />
								<span>{loading ? "Reanalisando..." : "Reanalisar"}</span>
							</button>

							<div className="h-4 w-px bg-zinc-200 hidden sm:block" />

							{/* Status do Provedor */}
							<button
								onClick={() => setIsSettingsOpen(true)}
								className="text-xs font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
								title="Configurações de IA"
							>
								<Cpu className="w-3.5 h-3.5 text-zinc-500" />
								<span className="text-[11px] font-semibold">{aiProviderName}</span>
							</button>
						</div>


						{/* Abas de Navegação (Segmented Control Elegante) */}
						<div className="inline-flex p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 self-start lg:self-center">
							<button
								onClick={() => setActiveTab("overview")}
								className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
									activeTab === "overview"
										? "bg-white text-zinc-900 shadow-xs font-bold"
										: "text-zinc-500 hover:text-zinc-900"
								}`}
							>
								<LayoutDashboard className="w-3.5 h-3.5" />
								<span>Visão Geral</span>
							</button>

							<button
								onClick={() => setActiveTab("findings")}
								className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
									activeTab === "findings"
										? "bg-white text-zinc-900 shadow-xs font-bold"
										: "text-zinc-500 hover:text-zinc-900"
								}`}
							>
								<CheckSquare className="w-3.5 h-3.5" />
								<span>Problemas ({result.findings.length})</span>
							</button>

							<button
								onClick={() => setActiveTab("comparison")}
								className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
									activeTab === "comparison"
										? "bg-white text-zinc-900 shadow-xs font-bold"
										: "text-zinc-500 hover:text-zinc-900"
								}`}
							>
								<GitCompare className="w-3.5 h-3.5" />
								<span>Comparação</span>
							</button>

							<button
								onClick={() => setActiveTab("report")}
								className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
									activeTab === "report"
										? "bg-white text-zinc-900 shadow-xs font-bold"
										: "text-zinc-500 hover:text-zinc-900"
								}`}
							>
								<FileText className="w-3.5 h-3.5" />
								<span>Relatório</span>
							</button>
						</div>

						{/* Ações Rápidas */}
						<div className="flex items-center gap-2 self-start lg:self-auto">
							{result.rewrittenText && (
								<button
									onClick={handleApplyFullAiRewrite}
									className="text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
									title="Substituir todo o texto pela versão integral reescrita pela IA"
								>
									<Wand2 className="w-3.5 h-3.5 text-zinc-600" />
									<span>Versão Integral IA</span>
								</button>
							)}

							<button
								type="button"
								onClick={() => setIsTemplateDrawerOpen(true)}
								className="text-xs font-bold text-zinc-900 bg-[#fef7eb] hover:bg-[#fdecd0] border border-[#FBB040] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
								title={`Visualizar o texto formatado no modelo oficial de ${documentTypesData.find(dt => dt.type === (result.input.documentType || "comunicado"))?.label || "Documento"}`}
							>
								<FileText className="w-3.5 h-3.5 text-[#d98a1a]" />
								<span>Ver {documentTypesData.find(dt => dt.type === (result.input.documentType || "comunicado"))?.label || "Documento"}</span>
							</button>


							<button
								onClick={() => setIsExportOpen(true)}
								className="text-xs font-bold bg-[#FBB040] hover:bg-[#e59b2b] text-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all border border-[#d98a1a]"
							>
								<Download className="w-3.5 h-3.5 text-black stroke-[2.5]" />
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
										<h3 className="text-base font-black text-black">
											Principais Oportunidades de Melhoria
										</h3>
										<button
											onClick={() => setActiveTab("findings")}
											className="text-xs text-black font-bold hover:text-[#d98a1a] hover:underline"
										>
											Ver todos os {result.findings.length} apontamentos →
										</button>
									</div>

									<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
										<div className="lg:col-span-6">
											<AnnotatedText
												text={result.workingText || result.input.text}
												originalInputText={result.input.text}
												findings={result.findings}
												selectedFinding={selectedFinding}
												onSelectFinding={setSelectedFinding}
												onUpdateText={handleUpdateWorkingText}
												onReanalyze={handleReanalyze}
												isReanalyzing={loading}
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
										originalInputText={result.input.text}
										findings={result.findings}
										selectedFinding={selectedFinding}
										onSelectFinding={setSelectedFinding}
										onUpdateText={handleUpdateWorkingText}
										onReanalyze={handleReanalyze}
										isReanalyzing={loading}
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
							workingText={result.workingText}
							rewrittenText={result.rewrittenText || result.input.text}
							semanticValidation={result.semanticValidation}
							onApplyRewritten={handleApplyFullAiRewrite}
						/>
					)}

					{activeTab === "report" && (
						<FullReport result={result} />
					)}
				</div>
			)}

			<ExportModal
				result={result!}
				isOpen={isExportOpen}
				onClose={() => setIsExportOpen(false)}
			/>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onSaved={updateAiProviderDisplay}
			/>

			{result && (
				<DynamicDocumentDrawer
					isOpen={isTemplateDrawerOpen}
					onClose={() => setIsTemplateDrawerOpen(false)}
					text={result.workingText || result.input.text}
					docType={result.input.documentType || "comunicado"}
				/>
			)}
		</div>
	);
}

