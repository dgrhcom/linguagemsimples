"use client";

import { useState, useEffect } from "react";
import { TextEditor } from "@/components/editor/text-editor";
import { ScoreOverview } from "@/components/analysis/score-overview";
import { AnnotatedText } from "@/components/findings/annotated-text";
import { FindingsList } from "@/components/findings/findings-list";
import { ComparisonView } from "@/components/comparison/comparison-view";

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
	Cpu,
	Settings,
	ArrowRight
} from "lucide-react";

import { safeStorage } from "@/lib/storage";

export default function AnalisarPage() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
	const [activeTab, setActiveTab] = useState<"overview" | "findings" | "comparison">("overview");
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

		const sentenceFindings = result.findings.filter(
			f => (!f.status || f.status === "pending") && f.category === "sentence" && f.suggestedText && f.suggestedText.trim() !== f.originalText.trim()
		);

		const otherFindings = result.findings.filter(
			f => (!f.status || f.status === "pending") && f.category !== "sentence" && f.suggestedText && f.suggestedText.trim() !== f.originalText.trim()
		);

		const appliedIds = new Set<string>();

		for (const f of sentenceFindings) {
			if (currentText.includes(f.originalText)) {
				currentText = currentText.replace(f.originalText, f.suggestedText!);
				appliedCount++;
				appliedIds.add(f.id);

				for (const of_ of otherFindings) {
					if (f.originalText.includes(of_.originalText)) {
						appliedIds.add(of_.id);
						appliedCount++;
					}
				}
			}
		}

		for (const f of otherFindings) {
			if (!appliedIds.has(f.id) && currentText.includes(f.originalText)) {
				currentText = currentText.replace(f.originalText, f.suggestedText!);
				appliedCount++;
				appliedIds.add(f.id);
			}
		}

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
		<div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-section space-y-6">
			{/* Toast Notification */}
			{toastMessage && (
				<div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-5 py-3.5 rounded-tile flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
					<span className="text-body-sm font-display">{toastMessage}</span>
				</div>
			)}

			{/* Se não houver resultado, exibe o Editor */}
			{!result && (
				<div className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
						<div>
							<h1 className="font-display text-heading-sm text-ink">
								Avaliação de Texto em Linguagem Simples
							</h1>
							<p className="text-body-sm text-charcoal mt-1">
								Cole sua mensagem, ofício ou relatório para receber diagnóstico multidimensional e propostas de simplificação.
							</p>
						</div>

						<button
							onClick={() => setIsSettingsOpen(true)}
							className="self-start sm:self-auto text-body-sm font-sans px-3.5 py-2 rounded-btn border border-sand hover:border-deep-stone bg-paper hover:bg-sand/50 text-charcoal flex items-center gap-2 transition-colors"
							title="Configurar Chaves de API de IA"
						>
							<Cpu className="w-3.5 h-3.5 text-amber" />
							<span>{aiProviderName}</span>
							<Settings className="w-3 h-3 text-stone ml-1" />
						</button>
					</div>

					<TextEditor onAnalyze={handleAnalyze} isLoading={loading} initialText={draftInitialText} />
				</div>
			)}

			{/* Se houver resultado, exibe o Painel de Análise */}
			{result && (
				<div className="space-y-6">
					{/* Barra Sticky de Ferramentas e Abas */}
					<div className="sticky top-24 z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-[24px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
						{/* Ferramentas - Esquerda */}
						<div className="flex items-center gap-2">
							<button
								onClick={handleResetAnalysis}
								className="text-[14px] flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors"
								style={{ color: "#b0aea5" }}
								onMouseEnter={(e) => { e.currentTarget.style.color = "#141413"; e.currentTarget.style.backgroundColor = "rgba(227, 218, 204, 0.4)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; e.currentTarget.style.backgroundColor = "transparent"; }}
								title="Voltar ao editor completo"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								<span>Nova Análise</span>
							</button>

							<button
								onClick={() => handleReanalyze()}
								disabled={loading}
								className="text-[14px] flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors"
								style={{ color: "#141413" }}
								onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(227, 218, 204, 0.4)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
								title="Reanalisar o texto"
							>
								<RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: "#d97757" }} />
								<span>{loading ? "Reanalisando..." : "Reanalisar"}</span>
							</button>
						</div>

						{/* Abas - Centro */}
						<div className="inline-flex p-1 rounded-[8px] self-start lg:self-center" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
							{[
								{ key: "overview" as const, label: "Visão Geral", Icon: LayoutDashboard },
								{ key: "findings" as const, label: `Problemas (${result.findings.length})`, Icon: CheckSquare },
								{ key: "comparison" as const, label: "Comparação", Icon: GitCompare },
							].map(tab => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key)}
									className="text-[14px] px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-colors"
									style={{
										backgroundColor: activeTab === tab.key ? "#faf9f5" : "transparent",
										color: activeTab === tab.key ? "#141413" : "#b0aea5",
										border: activeTab === tab.key ? "1px solid #cccbc8" : "1px solid transparent",
										fontWeight: activeTab === tab.key ? 600 : 400
									}}
								>
									<tab.Icon className="w-3.5 h-3.5" />
									<span>{tab.label}</span>
								</button>
							))}
						</div>

						{/* CTA - Direita */}
						<div className="flex items-center gap-2 self-start lg:self-auto">
							<button
								onClick={() => setIsExportOpen(true)}
								className="text-[14px] px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition-colors"
								style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}
							>
								<Download className="w-3.5 h-3.5" style={{ color: "#b0aea5" }} />
								<span>Exportar</span>
							</button>

							<button
								type="button"
								onClick={() => setIsTemplateDrawerOpen(true)}
								className="text-[14px] px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition-colors font-semibold"
								style={{ backgroundColor: "#d97757", border: "1px solid #c6613f", color: "#ffffff" }}
								title={`Ver ${documentTypesData.find(dt => dt.type === (result.input.documentType || "comunicado"))?.label || "Documento"}`}
							>
								<FileText className="w-3.5 h-3.5" />
								<span>Ver {documentTypesData.find(dt => dt.type === (result.input.documentType || "comunicado"))?.label || "Documento"}</span>
							</button>
						</div>
					</div>


					{/* Conteúdo Dinâmico da Aba Ativa */}
					{activeTab === "overview" && (
						<div className="space-y-6">
							<ScoreOverview score={result.score} metrics={result.metrics} />

							{/* CTA para aba de Problemas */}
							{result.findings.length > 0 && (
								<div className="text-center py-8">
									<button
										onClick={() => setActiveTab("findings")}
										className="text-[16px] font-semibold px-8 py-4 rounded-[8px] inline-flex items-center gap-2 transition-all"
										style={{
											backgroundColor: "#141413",
											border: "1px solid #3d3d3a",
											color: "#faf9f5",
											fontFamily: "var(--font-anthropic-sans)"
										}}
										onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3d3d3a"; }}
										onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#141413"; }}
									>
										<CheckSquare className="w-5 h-5" style={{ color: "#d97757" }} />
										<span>Ver todos os {result.findings.length} problemas</span>
										<ArrowRight className="w-4 h-4" />
									</button>
									<p className="text-[14px] mt-3" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
										Visualize o texto anotado e todas as sugestões de melhoria
									</p>
								</div>
							)}
						</div>
					)}

					{activeTab === "findings" && (
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							<div className="lg:col-span-5">
								<div className="sticky top-36">
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
