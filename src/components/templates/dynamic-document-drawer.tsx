"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  FileText,
  Copy,
  Printer,
  Download,
  Eye,
  Check,
  ExternalLink,
  Upload,
  Trash2,
  CheckCircle2,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DynamicDocumentSheet } from "./dynamic-document-sheet";
import { generateDocumentDocx } from "@/lib/templates/docx-document-generator";
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";
import { Button } from "@/components/ui/button";

interface DynamicDocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  docType?: DocumentType;
}

export function DynamicDocumentDrawer({
  isOpen,
  onClose,
  text,
  docType = "comunicado"
}: DynamicDocumentDrawerProps) {
  const [activeView, setActiveView] = useState<"sheet" | "gabarito">("sheet");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showGDocsModal, setShowGDocsModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeGabaritoPage, setActiveGabaritoPage] = useState(0);

  // Busca metadados e gabarito oficial do tipo de documento
  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];
  const gabaritoPages = currentTypeInfo.modelImagePages || (currentTypeInfo.modelImagePath ? [currentTypeInfo.modelImagePath] : []);

  // Metadados dinâmicos e editáveis do Documento
  const [metadata, setMetadata] = useState<UniversalDocumentMetadata>(() => {
    const base: UniversalDocumentMetadata = {
      unitName: "Diretoria Geral de Recursos Humanos",
      documentNumber: "01/2026",
      emailSite: "dgrh@unicamp.br | www.dgrh.unicamp.br",
      locationAndDate: "Campinas, 27 de agosto de 2026.",
      authorName: "Coordenação Geral da DGRH",
      authorRole: "Diretoria Geral de Recursos Humanos",
      customUnitLogo: undefined,
      hideUnicampLogo: false
    };
    return { ...base, ...(currentTypeInfo.defaultMetadata as any) };
  });


  // Atualiza metadados padrão quando troca de documento
  useEffect(() => {
    if (currentTypeInfo.defaultMetadata) {
      setMetadata((prev: UniversalDocumentMetadata) => ({
        ...prev,
        ...currentTypeInfo.defaultMetadata
      }));
    }
  }, [docType]);

  useEffect(() => {
    if (!metadata.locationAndDate) {
      const today = new Date();
      const formatted = today.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      setMetadata((prev: UniversalDocumentMetadata) => ({
        ...prev,
        locationAndDate: `Campinas, ${formatted}.`
      }));
    }
  }, []);

  if (!isOpen) return null;

  // Classificação dos grupos de formulário
  const isNormative = [
    "portaria", "resolucao", "deliberacao", "instrucao-normativa",
    "ordinance", "resolution", "instruction", "regulation"
  ].includes(docType);


  const isRegimentoOuRegulamento = ["regimento", "regulamento"].includes(docType);
  const isLetter = ["oficio", "oficio-circular", "official-letter"].includes(docType);
  const isCarta = ["carta"].includes(docType);
  const isMemo = ["memorando", "memo"].includes(docType);
  const isMinutes = ["ata", "minutes"].includes(docType);
  const isPauta = ["pauta"].includes(docType);
  const isParecer = ["parecer", "opinion"].includes(docType);
  const isDecisaoOuDespacho = ["decisao", "despacho"].includes(docType);
  const isInformacao = ["informacao"].includes(docType);
  const isDeclaracao = ["declaracao", "declaration"].includes(docType);
  const isCertificado = ["certificado"].includes(docType);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (PNG, JPG ou SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, customUnitLogo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUnitLogo = () => {
    setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, customUnitLogo: undefined }));
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateDocumentDocx(docType, text, metadata);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (currentTypeInfo.label || "Documento").replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `${cleanName}_Unicamp_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar DOCX:", err);
      alert("Houve um erro ao gerar o documento DOCX. Tente novamente.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyFormatted = async () => {
    try {
      const sheetElement = document.getElementById("printable-document-sheet");
      if (!sheetElement) return;

      const htmlContent = sheetElement.innerHTML;
      const plainTextContent = sheetElement.innerText;

      if (navigator.clipboard && window.ClipboardItem) {
        const typeHtml = "text/html";
        const typePlain = "text/plain";
        const blobHtml = new Blob([htmlContent], { type: typeHtml });
        const blobPlain = new Blob([plainTextContent], { type: typePlain });
        const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typePlain]: blobPlain })];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(plainTextContent);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenInGoogleDocs = async () => {
    await handleCopyFormatted();
    setShowGDocsModal(true);
  };

  const inputClasses = "w-full text-body-sm p-2 bg-paper-light border border-sand rounded-input focus:bg-white focus:ring-1 focus:ring-deep-stone outline-hidden";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      {/* Modal Instrucional Google Docs */}
      {showGDocsModal && (
        <div className="fixed inset-0 z-70 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper rounded-card p-6 max-w-md w-full border border-slate animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-tile bg-amber/10 text-amber flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-body font-display text-ink">
                Documento copiado com formatação!
              </h3>
              <p className="text-body-sm text-charcoal leading-relaxed">
                A folha com o layout oficial de <strong>{currentTypeInfo.label}</strong> e o texto simplificado já estão na sua área de transferência.
              </p>
            </div>
            <div className="bg-sand/30 border border-sand rounded-tile p-3.5 space-y-2 text-body-sm text-charcoal">
              <p className="font-semibold text-ink flex items-center gap-1.5">
                <span>Passo a passo no Google Docs:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-micro-label text-stone">
                <li>Clique no botão abaixo para abrir um documento novo no Docs;</li>
                <li>Pressione <kbd className="bg-paper border border-sand px-1.5 py-0.5 rounded-btn font-mono font-bold">Ctrl + V</kbd> (ou <kbd className="bg-paper border border-sand px-1.5 py-0.5 rounded-btn font-mono font-bold">Cmd + V</kbd>);</li>
                <li>Ou use o botão <strong>&quot;Baixar DOCX&quot;</strong> para abrir diretamente no Docs.</li>
              </ol>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setShowGDocsModal(false)}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Fechar
              </Button>
              <a
                href="https://docs.new"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowGDocsModal(false)}
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Ir para Google Docs
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Container Principal do Drawer */}
      <div className="bg-sand/30 w-full max-w-6xl h-full border-l border-slate flex flex-col justify-between">
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DO DRAWER */}
        {/* ========================================================================= */}
        <div className="bg-paper border-b border-sand px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-body-sm font-display text-ink">
                  Modelo Oficial: {currentTypeInfo.label}
                </h2>
                <span className="text-micro-label bg-amber/10 text-amber-dark px-2 py-0.5 rounded-btn border border-amber/30">
                  {currentTypeInfo.category}
                </span>
              </div>
              <p className="text-micro-label text-stone">
                Padrão Unicamp • Fonte Arial 12pt • Margens Oficiais
              </p>
            </div>
          </div>

          {/* Seletor de Visualização (Folha / Gabarito) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-sand/50 rounded-btn border border-sand text-body-sm">
              <Button
                type="button"
                onClick={() => setActiveView("sheet")}
                variant={activeView === "sheet" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5 text-amber" />}
              >
                Folha Oficial
              </Button>

              <Button
                type="button"
                onClick={() => setActiveView("gabarito")}
                variant={activeView === "gabarito" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<Eye className="w-3.5 h-3.5 text-amber" />}
              >
                Gabarito Unicamp ({gabaritoPages.length} pág.)
              </Button>
            </div>

            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="ml-2 p-2"
              leftIcon={<X className="w-5 h-5" />}
              title="Fechar painel"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DRAWER: COLUNA ESQUERDA (CAMPOS) + COLUNA DIREITA (VISUALIZAÇÃO) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-hidden flex bg-sand/20">
          {/* COLUNA ESQUERDA: CAMPOS DO MODELO (FIXA) */}
          <div className="w-[380px] shrink-0 border-r border-sand bg-paper overflow-y-auto p-5 space-y-5">
            <div>
              <h3 className="text-body-sm font-display text-ink">
                Campos: {currentTypeInfo.label}
              </h3>
              <p className="text-micro-label text-stone mt-0.5">
                Preencha os dados para montar o cabeçalho e a estrutura oficial.
              </p>
            </div>

            {/* SEÇÃO 1: CABEÇALHO GERAL INSTITUCIONAL */}
            {!isCertificado && (
              <div className="space-y-3">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Cabeçalho e Identificação da Unidade
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Nome da Unidade / Órgão</label>
                    <input
                      type="text"
                      value={metadata.unitName}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, unitName: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Número do Documento / Ano</label>
                    <input
                      type="text"
                      value={metadata.documentNumber}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, documentNumber: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">E-mail e Site Institucional</label>
                    <input
                      type="text"
                      value={metadata.emailSite}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, emailSite: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Local e Data</label>
                    <input
                      type="text"
                      value={metadata.locationAndDate}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, locationAndDate: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Upload do Logotipo da Unidade */}
                <div className="pt-1">
                  <label className="block text-micro-label text-ink mb-0.5">Logotipo da Unidade (Opcional)</label>
                  <div className="flex items-center gap-2">
                    {metadata.customUnitLogo ? (
                      <div className="flex items-center gap-2 bg-sand/30 p-1.5 rounded-tile border border-sand">
                        <img src={metadata.customUnitLogo} alt="Logo" className="h-8 w-auto object-contain" />
                        <Button
                          type="button"
                          onClick={handleRemoveUnitLogo}
                          variant="destructive"
                          size="sm"
                          leftIcon={<Trash2 className="w-3 h-3" />}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-micro-label text-charcoal hover:text-ink bg-sand/30 border border-sand hover:bg-sand px-3 py-1.5 rounded-btn flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3 h-3 text-stone" />
                        <span>Enviar imagem</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 2: CAMPOS CONTEXTUAIS DO MODELO ESPECÍFICO */}
            {/* A. ATOS NORMATIVOS */}
            {isNormative && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Estrutura Normativa
                </h4>

                <div>
                  <label className="block text-micro-label text-ink mb-0.5">Ementa</label>
                  <textarea
                    rows={2}
                    value={metadata.ementa || ""}
                    onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, ementa: e.target.value }))}
                    placeholder="Dispõe sobre os procedimentos..."
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-micro-label text-ink mb-0.5">Preâmbulo / Fundamentação Legal</label>
                  <textarea
                    rows={2}
                    value={metadata.preamble || ""}
                    onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, preamble: e.target.value }))}
                    placeholder="O Reitor da Universidade Estadual de Campinas, no uso de suas atribuições legais, resolve:"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-micro-label text-ink mb-0.5">Cláusula de Vigência</label>
                  <input
                    type="text"
                    value={metadata.effectiveClause || ""}
                    onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, effectiveClause: e.target.value }))}
                    placeholder="Esta Portaria entra em vigor na data de sua publicação."
                    className={inputClasses}
                  />
                </div>
              </div>
            )}

            {/* B. OFÍCIO E OFÍCIO CIRCULAR */}
            {isLetter && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Destinatário, Assunto e Vocativo
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Pronome de Tratamento</label>
                    <input
                      type="text"
                      value={metadata.recipientTitle || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientTitle: e.target.value }))}
                      placeholder="A Sua Senhoria o Senhor"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Nome do Destinatário</label>
                    <input
                      type="text"
                      value={metadata.recipientName || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="Prof. Dr. Diretor de Faculdade"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Cargo / Função do Destinatário</label>
                    <input
                      type="text"
                      value={metadata.recipientRole || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientRole: e.target.value }))}
                      placeholder="Diretor do Instituto de Computação"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Endereço Completo com CEP</label>
                    <input
                      type="text"
                      value={metadata.recipientAddress || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, recipientAddress: e.target.value }))}
                      placeholder="Av. Albert Einstein, 1251 - CEP 13083-852"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Assunto em Destaque</label>
                    <input
                      type="text"
                      value={metadata.subject || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Solicitação de providências técnicas..."
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Vocativo Formal</label>
                    <input
                      type="text"
                      value={metadata.vocativo || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, vocativo: e.target.value }))}
                      placeholder="Senhor Diretor,"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Fecho</label>
                    <input
                      type="text"
                      value={metadata.fecho || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, fecho: e.target.value }))}
                      placeholder="Atenciosamente,"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* C. MEMORANDO */}
            {isMemo && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Tramitação Interna
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">PARA (Destino)</label>
                    <input
                      type="text"
                      value={metadata.memoPara || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoPara: e.target.value }))}
                      placeholder="Diretoria de Administração"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">DE (Origem)</label>
                    <input
                      type="text"
                      value={metadata.memoDe || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoDe: e.target.value }))}
                      placeholder="Divisão de Desenvolvimento de Pessoas"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">ASSUNTO</label>
                    <input
                      type="text"
                      value={metadata.memoAssunto || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, memoAssunto: e.target.value }))}
                      placeholder="Encaminhamento de relatório de necessidades..."
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* D. ATA E PAUTA DE REUNIÃO */}
            {(isMinutes || isPauta) && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Dados da Reunião / Colegiado
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Identificação da Reunião</label>
                    <input
                      type="text"
                      value={metadata.meetingNumber || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingNumber: e.target.value }))}
                      placeholder="15ª Reunião Ordinária da Comissão..."
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Data e Horário</label>
                    <input
                      type="text"
                      value={metadata.meetingDate || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingDate: e.target.value }))}
                      placeholder="27 de agosto de 2026, às 14h00"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Local / Plataforma</label>
                    <input
                      type="text"
                      value={metadata.meetingPlace || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingPlace: e.target.value }))}
                      placeholder="Sala de Reuniões da DGRH / Teams"
                      className={inputClasses}
                    />
                  </div>

                  {isMinutes && (
                    <>
                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Presidência</label>
                        <input
                          type="text"
                          value={metadata.meetingPresident || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingPresident: e.target.value }))}
                          placeholder="Profa. Dra. Coordenadora Geral"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Secretaria</label>
                        <input
                          type="text"
                          value={metadata.meetingSecretary || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, meetingSecretary: e.target.value }))}
                          placeholder="Secretário(a) da Comissão"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Membros Presentes</label>
                        <input
                          type="text"
                          value={metadata.membersPresent || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, membersPresent: e.target.value }))}
                          placeholder="Membro 1, Membro 2, Membro 3"
                          className={inputClasses}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* E. PARECER, DECISÃO, DESPACHO E INFORMAÇÃO */}
            {(isParecer || isDecisaoOuDespacho || isInformacao) && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Referência Processual
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Número do Processo</label>
                    <input
                      type="text"
                      value={metadata.referenceProcess || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, referenceProcess: e.target.value }))}
                      placeholder="Processo nº 01-P-12345/2026"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Interessado(a)</label>
                    <input
                      type="text"
                      value={metadata.interestedParty || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, interestedParty: e.target.value }))}
                      placeholder="Nome da Unidade ou Servidor"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* F. DECLARAÇÃO E CERTIFICADO */}
            {(isDeclaracao || isCertificado) && (
              <div className="space-y-3 pt-3 border-t border-sand">
                <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                  Dados do Interessado e Atividade
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Nome Completo</label>
                    <input
                      type="text"
                      value={metadata.targetPerson || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, targetPerson: e.target.value }))}
                      placeholder="Nome Completo da Pessoa"
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="block text-micro-label text-ink mb-0.5">Documento (RG / CPF)</label>
                    <input
                      type="text"
                      value={metadata.targetDocument || ""}
                      onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, targetDocument: e.target.value }))}
                      placeholder="RG nº 00.000.000-0"
                      className={inputClasses}
                    />
                  </div>

                  {isCertificado && (
                    <>
                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Nome do Curso / Evento</label>
                        <input
                          type="text"
                          value={metadata.courseName || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, courseName: e.target.value }))}
                          placeholder="Capacitação em Redação Oficial"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Carga Horária</label>
                        <input
                          type="text"
                          value={metadata.courseHours || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, courseHours: e.target.value }))}
                          placeholder="20 horas"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-micro-label text-ink mb-0.5">Período de Realização</label>
                        <input
                          type="text"
                          value={metadata.coursePeriod || ""}
                          onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, coursePeriod: e.target.value }))}
                          placeholder="10 a 25 de agosto de 2026"
                          className={inputClasses}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SEÇÃO 3: ASSINATURA */}
            <div className="space-y-3 pt-3 border-t border-sand">
              <h4 className="text-micro-label text-stone border-b border-sand pb-1">
                Signatário / Autoridade
              </h4>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-micro-label text-ink mb-0.5">Nome do(a) Signatário(a)</label>
                  <input
                    type="text"
                    value={metadata.authorName}
                    onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, authorName: e.target.value }))}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-micro-label text-ink mb-0.5">Cargo / Função</label>
                  <input
                    type="text"
                    value={metadata.authorRole}
                    onChange={(e) => setMetadata((prev: UniversalDocumentMetadata) => ({ ...prev, authorRole: e.target.value }))}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: ÁREA DE VISUALIZAÇÃO */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-start">
            {/* VISUALIZAÇÃO: FOLHA A4 OFICIAL */}
            {activeView === "sheet" && (
              <div className="w-full flex flex-col items-center space-y-4 max-w-4xl">
                {/* Controles de Zoom e Impressão */}
                <div className="w-full flex justify-between items-center bg-paper px-4 py-2 rounded-card border border-sand">
                  <div className="flex items-center gap-2 text-body-sm font-semibold text-charcoal">
                    <span>Zoom:</span>
                    <Button
                      type="button"
                      onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
                      variant="secondary"
                      size="xs"
                    >
                      -
                    </Button>
                    <span className="font-mono">{Math.round(zoom * 100)}%</span>
                    <Button
                      type="button"
                      onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
                      variant="secondary"
                      size="xs"
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-micro-label text-stone">
                    {currentTypeInfo.competence && (
                      <span><strong>Competência:</strong> {currentTypeInfo.competence}</span>
                    )}
                  </div>
                </div>

                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="transition-transform duration-150 w-full flex justify-center">
                  <DynamicDocumentSheet
                    text={text}
                    metadata={metadata}
                    docType={docType}
                  />
                </div>
              </div>
            )}

            {/* VISUALIZAÇÃO: GABARITO OFICIAL DA UNICAMP (APENAS A IMAGEM) */}
            {activeView === "gabarito" && (
              <div className="w-full max-w-3xl space-y-4">
                {/* Barra de Seleção de Página do Gabarito */}
                <div className="bg-paper p-3 rounded-card border border-sand flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-semibold text-ink">Páginas do Gabarito:</span>
                    <div className="flex gap-1.5">
                      {gabaritoPages.map((_, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGabaritoPage(idx)}
                          variant={activeGabaritoPage === idx ? "primary" : "secondary"}
                          size="sm"
                        >
                          Página {idx + 1}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <a
                    href={currentTypeInfo.unicampUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghost-link text-body-sm text-ink font-semibold flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Ver diretrizes no portal Unicamp</span>
                  </a>
                </div>

                {/* Gabarito Oficial - Apenas a Imagem */}
                <div className="bg-paper p-4 rounded-card border border-sand space-y-3">
                  <div className="flex items-center justify-between border-b border-sand pb-2">
                    <span className="text-body-sm font-semibold text-ink">
                      Gabarito Oficial Unicamp (Página {activeGabaritoPage + 1})
                    </span>
                    <span className="text-micro-label text-stone">
                      Fonte: linguagemsimples.unicamp.br
                    </span>
                  </div>

                  <div className="relative aspect-[1/1.414] w-full border border-sand rounded-card overflow-hidden bg-sand/20">
                    {gabaritoPages[activeGabaritoPage] ? (
                      <Image
                        src={gabaritoPages[activeGabaritoPage]}
                        alt={`Gabarito ${currentTypeInfo.label} pág. ${activeGabaritoPage + 1}`}
                        fill
                        className="object-contain p-2"
                        priority
                      />
                    ) : (
                      <div className="p-8 text-center text-body-sm text-stone flex items-center justify-center h-full">
                        Gabarito oficial em conformidade com as diretrizes da Unicamp.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE AÇÕES INFERIOR DO DRAWER */}
        {/* ========================================================================= */}
        <div className="bg-paper border-t border-sand px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleCopyFormatted}
              variant="secondary"
              size="md"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-success stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copiado com Sucesso!" : "Copiar Folha"}
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              variant="secondary"
              size="md"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Imprimir / Salvar PDF
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleOpenInGoogleDocs}
              variant="secondary"
              size="md"
              leftIcon={<ExternalLink className="w-3.5 h-3.5 text-amber" />}
            >
              Abrir no Google Docs
            </Button>

            <Button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              variant="primary"
              size="md"
              leftIcon={<Download className="w-3.5 h-3.5 stroke-[2.5]" />}
            >
              {isExportingDocx ? "Gerando Word..." : `Baixar DOCX (${currentTypeInfo.label})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
