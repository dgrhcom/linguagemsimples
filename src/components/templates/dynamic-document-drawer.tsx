"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
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
  BookOpen
} from "lucide-react";
import { DynamicDocumentSheet } from "./dynamic-document-sheet";
import { generateDocumentDocx } from "@/lib/templates/docx-document-generator";
import { DocumentType, UniversalDocumentMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";

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

  const currentTypeInfo = documentTypesData.find(dt => dt.type === docType) || documentTypesData[0];
  const gabaritoPages = currentTypeInfo.modelImagePages || (currentTypeInfo.modelImagePath ? [currentTypeInfo.modelImagePath] : []);

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
    // Create a new window with only the document for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir.");
      return;
    }

    const sheetElement = document.getElementById("printable-document-sheet");
    if (!sheetElement) {
      alert("Documento não encontrado para impressão.");
      return;
    }

    // Clone the element and inline all computed styles
    const clonedElement = sheetElement.cloneNode(true) as HTMLElement;
    const allElements = clonedElement.querySelectorAll("*");
    allElements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el as Element);
      let styleText = "";
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        styleText += `${prop}: ${computedStyle.getPropertyValue(prop)}; `;
      }
      (el as HTMLElement).setAttribute("style", styleText);
    });
    // Also inline the root element style
    const rootStyle = window.getComputedStyle(sheetElement);
    let rootStyleText = "";
    for (let i = 0; i < rootStyle.length; i++) {
      const prop = rootStyle[i];
      rootStyleText += `${prop}: ${rootStyle.getPropertyValue(prop)}; `;
    }
    clonedElement.setAttribute("style", rootStyleText);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Imprimir Documento - ${currentTypeInfo.label}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 25mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td, th {
            padding: 4px 8px;
          }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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

  const inputClasses = "w-full text-[14px] leading-[1] tracking-[-0.08px] p-2 bg-ivory-light border border-stone rounded-[8px] focus:bg-white focus:ring-1 focus:ring-cloud-dark outline-hidden";

  return (
    <>
      {/* Modal Instrucional Google Docs */}
      <Modal
        isOpen={showGDocsModal}
        onClose={() => setShowGDocsModal(false)}
        title="Documento copiado com formatação!"
        size="sm"
      >
        <ModalBody>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-clay/10 text-clay flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[16px] text-slate-dark leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
                A folha com o layout oficial de <strong>{currentTypeInfo.label}</strong> e o texto simplificado já estão na sua área de transferência.
              </p>
            </div>
          </div>
          <div className="bg-oat-warm/30 border border-stone rounded-[12px] p-4 space-y-2 text-[16px] text-slate-dark">
            <p className="font-semibold text-slate-dark flex items-center gap-1.5" style={{ fontFamily: "var(--font-anthropic-sans)" }}>
              <span>Passo a passo no Google Docs:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[12px] text-cloud-medium">
              <li>Clique no botão abaixo para abrir um documento novo no Docs;</li>
              <li>Pressione <kbd className="bg-ivory-light border border-stone px-1.5 py-0.5 rounded-[8px] font-mono font-bold">Ctrl + V</kbd> (ou <kbd className="bg-ivory-light border border-stone px-1.5 py-0.5 rounded-[8px] font-mono font-bold">Cmd + V</kbd>);</li>
              <li>Ou use o botão <strong>&quot;Baixar DOCX&quot;</strong> para abrir diretamente no Docs.</li>
            </ol>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            onClick={() => setShowGDocsModal(false)}
            variant="secondary"
            size="md"
          >
            Fechar
          </Button>
          <a
            href="https://docs.new"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setShowGDocsModal(false)}
          >
            <Button
              variant="primary"
              size="md"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Ir para Google Docs
            </Button>
          </a>
        </ModalFooter>
      </Modal>

      {/* Container Principal do Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Modelo Oficial: ${currentTypeInfo.label}`}
        description={`${currentTypeInfo.category} • Padrão Unicamp • Fonte Arial 12pt • Margens Oficiais`}
        size="xl"
        footer={
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
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
        }
      >
        {/* Seletor de Visualização - Inline no Header */}
        <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", borderBottom: "1px solid #cccbc8" }}>
          <span className="text-[10px] font-semibold" style={{ color: "#b0aea5" }}>Visualização:</span>
          <div className="inline-flex p-0.5 rounded-[8px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
            <button
              type="button"
              onClick={() => setActiveView("sheet")}
              className="text-[12px] px-3 py-1 rounded-[6px] flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: activeView === "sheet" ? "#141413" : "transparent",
                color: activeView === "sheet" ? "#faf9f5" : "#b0aea5",
                border: activeView === "sheet" ? "1px solid #3d3d3a" : "1px solid transparent",
                fontWeight: activeView === "sheet" ? 600 : 400
              }}
            >
              <FileText className="w-3 h-3" />
              Folha Oficial
            </button>
            <button
              type="button"
              onClick={() => setActiveView("gabarito")}
              className="text-[12px] px-3 py-1 rounded-[6px] flex items-center gap-1.5 transition-colors"
              style={{
                backgroundColor: activeView === "gabarito" ? "#141413" : "transparent",
                color: activeView === "gabarito" ? "#faf9f5" : "#b0aea5",
                border: activeView === "gabarito" ? "1px solid #3d3d3a" : "1px solid transparent",
                fontWeight: activeView === "gabarito" ? 600 : 400
              }}
            >
              <Eye className="w-3 h-3" />
              Gabarito ({gabaritoPages.length} pág.)
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-hidden flex min-h-0" style={{ backgroundColor: "#f0eee6" }}>
          {/* COLUNA ESQUERDA: CAMPOS DO MODELO */}
          <div className="w-[380px] shrink-0 overflow-y-auto p-5 space-y-5" style={{ backgroundColor: "#faf9f5", borderRight: "1px solid #cccbc8" }}>
            <div>
              <h3 className="text-[16px] tracking-[-0.08px] font-sans" style={{ color: "#141413" }}>
                Campos: {currentTypeInfo.label}
              </h3>
              <p className="text-[12px] text-cloud-medium mt-0.5">
                Preencha os dados para montar o cabeçalho e a estrutura oficial.
              </p>
            </div>

            {/* CABEÇALHO GERAL */}
            {!isCertificado && (
              <div className="space-y-3">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">
                  Cabeçalho e Identificação da Unidade
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Nome da Unidade / Órgão</label>
                    <input
                      type="text"
                      value={metadata.unitName}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, unitName: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                  {!isDeclaracao && (
                    <div>
                      <label className="block text-[10px] text-slate-dark mb-0.5">Número do Documento / Ano</label>
                      <input
                        type="text"
                        value={metadata.documentNumber}
                        onChange={(e) => setMetadata((prev) => ({ ...prev, documentNumber: e.target.value }))}
                        className={inputClasses}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">E-mail e Site Institucional</label>
                    <input
                      type="text"
                      value={metadata.emailSite}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, emailSite: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Local e Data</label>
                    <input
                      type="text"
                      value={metadata.locationAndDate}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, locationAndDate: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <label className="block text-[10px] text-slate-dark mb-0.5">Logotipo da Unidade (Opcional)</label>
                  <div className="flex items-center gap-2">
                    {metadata.customUnitLogo ? (
                      <div className="flex items-center gap-2 bg-oat-warm/30 p-1.5 rounded-[12px] border border-stone">
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
                      <label className="cursor-pointer text-[10px] text-slate-dark hover:text-slate-dark bg-oat-warm/30 border border-stone hover:bg-oat-warm px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3 h-3 text-stone" />
                        <span>Enviar imagem</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.hideUnicampLogo || false}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, hideUnicampLogo: e.target.checked }))}
                      className="w-4 h-4 rounded border-stone text-slate-dark focus:ring-slate-dark"
                    />
                    <span className="text-[10px] text-slate-dark">Ocultar logotipo da Unicamp</span>
                  </label>
                </div>
              </div>
            )}

            {/* ATOS NORMATIVOS */}
            {isNormative && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Estrutura Normativa</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Ementa</label>
                    <textarea
                      rows={2}
                      value={metadata.ementa || ""}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, ementa: e.target.value }))}
                      placeholder="Dispõe sobre os procedimentos..."
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Preâmbulo / Fundamentação Legal</label>
                    <textarea
                      rows={2}
                      value={metadata.preamble || ""}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, preamble: e.target.value }))}
                      placeholder="O Reitor da Universidade Estadual de Campinas, no uso de suas atribuições legais, resolve:"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Cláusula de Vigência</label>
                    <input
                      type="text"
                      value={metadata.effectiveClause || ""}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, effectiveClause: e.target.value }))}
                      placeholder="Esta Portaria entra em vigor na data de sua publicação."
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OFÍCIO */}
            {isLetter && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Destinatário, Assunto e Vocativo</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Pronome de Tratamento</label>
                    <input type="text" value={metadata.recipientTitle || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, recipientTitle: e.target.value }))} placeholder="A Sua Senhoria o Senhor" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Nome do Destinatário</label>
                    <input type="text" value={metadata.recipientName || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, recipientName: e.target.value }))} placeholder="Prof. Dr. Diretor de Faculdade" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Cargo / Função</label>
                    <input type="text" value={metadata.recipientRole || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, recipientRole: e.target.value }))} placeholder="Diretor do Instituto de Computação" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Endereço com CEP</label>
                    <input type="text" value={metadata.recipientAddress || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, recipientAddress: e.target.value }))} placeholder="Av. Albert Einstein, 1251 - CEP 13083-852" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Assunto</label>
                    <input type="text" value={metadata.subject || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Solicitação de providências técnicas..." className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Vocativo</label>
                    <input type="text" value={metadata.vocativo || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, vocativo: e.target.value }))} placeholder="Senhor Diretor," className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Fecho</label>
                    <input type="text" value={metadata.fecho || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, fecho: e.target.value }))} placeholder="Atenciosamente," className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {/* MEMORANDO */}
            {isMemo && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Destinatário e Assunto</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Nome do Destinatário</label>
                    <input type="text" value={metadata.recipientName || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, recipientName: e.target.value }))} placeholder="Diretor de Administração" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Assunto</label>
                    <input type="text" value={metadata.memoAssunto || metadata.subject || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, memoAssunto: e.target.value, subject: e.target.value }))} placeholder="Encaminhamento de relatório..." className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {/* ATA/PAUTA */}
            {(isMinutes || isPauta) && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Dados da Reunião</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Identificação</label>
                    <input type="text" value={metadata.meetingNumber || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, meetingNumber: e.target.value }))} placeholder="15ª Reunião Ordinária..." className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Data e Horário</label>
                    <input type="text" value={metadata.meetingDate || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, meetingDate: e.target.value }))} placeholder="27 de agosto de 2026, às 14h00" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Local</label>
                    <input type="text" value={metadata.meetingPlace || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, meetingPlace: e.target.value }))} placeholder="Sala de Reuniões / Teams" className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {/* PARECER/DECISÃO */}
            {(isParecer || isDecisaoOuDespacho || isInformacao) && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Referência Processual</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Número do Processo</label>
                    <input type="text" value={metadata.referenceProcess || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, referenceProcess: e.target.value }))} placeholder="Processo nº 01-P-12345/2026" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Interessado(a)</label>
                    <input type="text" value={metadata.interestedParty || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, interestedParty: e.target.value }))} placeholder="Nome da Unidade ou Servidor" className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {/* CERTIFICADO */}
            {isCertificado && (
              <div className="space-y-3 pt-3 border-t border-stone">
                <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Dados do Interessado</h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Nome Completo</label>
                    <input type="text" value={metadata.targetPerson || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, targetPerson: e.target.value }))} placeholder="Nome Completo" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Curso / Evento</label>
                    <input type="text" value={metadata.courseName || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, courseName: e.target.value }))} placeholder="Capacitação em Redação Oficial" className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-dark mb-0.5">Carga Horária</label>
                    <input type="text" value={metadata.courseHours || ""} onChange={(e) => setMetadata((prev) => ({ ...prev, courseHours: e.target.value }))} placeholder="20 horas" className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            {/* ASSINATURA */}
            <div className="space-y-3 pt-3 border-t border-stone">
              <h4 className="text-[10px] text-cloud-medium border-b border-stone pb-1">Signatário / Autoridade</h4>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-dark mb-0.5">Nome do(a) Signatário(a)</label>
                  <input type="text" value={metadata.authorName} onChange={(e) => setMetadata((prev) => ({ ...prev, authorName: e.target.value }))} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-dark mb-0.5">Cargo / Função</label>
                  <input type="text" value={metadata.authorRole} onChange={(e) => setMetadata((prev) => ({ ...prev, authorRole: e.target.value }))} className={inputClasses} />
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: VISUALIZAÇÃO */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start" style={{ backgroundColor: "#f0eee6" }}>
            {activeView === "sheet" && (
              <div className="w-full flex flex-col items-center space-y-3 max-w-4xl">
                {/* Controles de Zoom - Compactos */}
                <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-[8px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
                  <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#141413" }}>
                    <span className="font-semibold">Zoom:</span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(0.7, zoom - 0.1))}
                      className="w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors"
                      style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", color: "#141413" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#d97757"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(227, 218, 204, 0.5)"; e.currentTarget.style.color = "#141413"; }}
                    >
                      -
                    </button>
                    <span className="font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
                      className="w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors"
                      style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", color: "#141413" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#d97757"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(227, 218, 204, 0.5)"; e.currentTarget.style.color = "#141413"; }}
                    >
                      +
                    </button>
                  </div>
                  {currentTypeInfo.competence && (
                    <div className="text-[10px]" style={{ color: "#b0aea5" }}>
                      <strong>Competência:</strong> {currentTypeInfo.competence}
                    </div>
                  )}
                </div>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="transition-transform duration-150 w-full flex justify-center">
                  <DynamicDocumentSheet text={text} metadata={metadata} docType={docType} />
                </div>
              </div>
            )}

            {activeView === "gabarito" && (
              <div className="w-full max-w-3xl space-y-3">
                {/* Seletor de Página - Compacto */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-[8px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
                  <span className="text-[12px] font-semibold" style={{ color: "#141413" }}>Páginas:</span>
                  <div className="flex gap-1">
                    {gabaritoPages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGabaritoPage(idx)}
                        className="text-[11px] px-2 py-0.5 rounded-[4px] transition-colors"
                        style={{
                          backgroundColor: activeGabaritoPage === idx ? "#141413" : "transparent",
                          color: activeGabaritoPage === idx ? "#faf9f5" : "#b0aea5",
                          border: activeGabaritoPage === idx ? "1px solid #3d3d3a" : "1px solid transparent"
                        }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <a href={currentTypeInfo.unicampUrl} target="_blank" rel="noopener noreferrer" className="ghost-link text-[16px] tracking-[-0.08px] text-slate-dark font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-clay" />
                    <span>Ver diretrizes no portal Unicamp</span>
                  </a>
                </div>
                <div className="bg-ivory-light p-4 rounded-[24px] border border-stone space-y-3">
                  <div className="flex items-center justify-between border-b border-stone pb-2">
                    <span className="text-[16px] tracking-[-0.08px] font-semibold text-slate-dark" style={{ fontFamily: "var(--font-anthropic-sans)" }}>
                      Gabarito Oficial Unicamp (Página {activeGabaritoPage + 1})
                    </span>
                    <span className="text-[12px] text-cloud-medium">Fonte: linguagemsimples.unicamp.br</span>
                  </div>
                  <div className="relative aspect-[1/1.414] w-full border border-stone rounded-[24px] overflow-hidden bg-oat-warm/20">
                    {gabaritoPages[activeGabaritoPage] ? (
                      <Image src={gabaritoPages[activeGabaritoPage]} alt={`Gabarito ${currentTypeInfo.label} pág. ${activeGabaritoPage + 1}`} fill className="object-contain p-2" priority />
                    ) : (
                      <div className="p-8 text-center text-[16px] text-cloud-medium flex items-center justify-center h-full" style={{ fontFamily: "var(--font-anthropic-serif)" }}>
                        Gabarito oficial em conformidade com as diretrizes da Unicamp.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
