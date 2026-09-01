"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Check,
  Eye,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen
} from "lucide-react";
import { DocumentType, DocumentTypeMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";

interface DocumentTypeSelectorProps {
  selectedType: DocumentType;
  onSelectType: (type: DocumentType) => void;
}

export function DocumentTypeSelector({
  selectedType,
  onSelectType
}: DocumentTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewingDoc, setPreviewingDoc] = useState<DocumentTypeMetadata | null>(null);
  const [modalPageIdx, setModalPageIdx] = useState(0);

  const selectedDocInfo = documentTypesData.find(dt => dt.type === selectedType) || documentTypesData[0];

  const categories = [
    { id: "all", label: "Todos os 20 Modelos", count: documentTypesData.length },
    { id: "normativo", label: "Atos Normativos e Decisórios", count: documentTypesData.filter(d => d.category === "normativo").length },
    { id: "correspondencia", label: "Correspondência Oficial", count: documentTypesData.filter(d => d.category === "correspondencia").length },
    { id: "administrativo", label: "Administrativo, Atas e Colegiados", count: documentTypesData.filter(d => d.category === "administrativo").length }
  ];

  const filteredDocs = (documentTypesData as DocumentTypeMetadata[]).filter(doc => {
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
    const matchesSearch =
      doc.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const previewPages = previewingDoc?.modelImagePages || (previewingDoc?.modelImagePath ? [previewingDoc.modelImagePath] : []);

  return (
    <div className="space-y-3">
      {/* Modal de Seleção de Modelo */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Selecionar Modelo Oficial"
        description="Escolha um dos 20 modelos disponiveis no Manual de Redação da Unicamp"
        size="xl"
      >
        <ModalBody>
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3" style={{ borderBottom: "1px solid #cccbc8" }}>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  variant={activeCategory === cat.id ? "primary" : "secondary"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-60 px-1.5 py-0.2">{cat.count}</span>
                </Button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#b0aea5" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo oficial..."
                className="w-full text-[14px] pl-8 pr-3 py-1.5 rounded-[8px] focus:ring-1 outline-hidden"
                style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}
              />
            </div>
          </div>

          {/* Grade de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = selectedType === doc.type;
              return (
                <div
                  key={doc.type}
                  onClick={() => {
                    onSelectType(doc.type);
                    setIsOpen(false);
                  }}
                  className={`relative text-left p-3.5 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between group`}
                  style={{
                    backgroundColor: isSelected ? "rgba(217, 119, 87, 0.1)" : "#faf9f5",
                    borderColor: isSelected ? "rgba(217, 119, 87, 0.4)" : "#cccbc8"
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px]" style={{ color: "#b0aea5" }}>{doc.category}</span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: "#141413", color: "#d97757" }}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        doc.modelImagePath && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewingDoc(doc);
                              setModalPageIdx(0);
                            }}
                            className="p-1 rounded-[8px] transition-colors flex items-center gap-1"
                            style={{ color: "#b0aea5" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#141413"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
                            title="Ver gabarito da Unicamp"
                          >
                            <Eye className="w-3.5 h-3.5" style={{ color: "#d97757" }} />
                          </button>
                        )
                      )}
                    </div>

                    <h4 className="text-[14px] font-semibold transition-colors" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>
                      {doc.label}
                    </h4>

                    <p className="text-[10px] leading-relaxed font-normal" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
                      {doc.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid #cccbc8" }}>
                    <span className="text-[10px]" style={{ color: "#b0aea5" }}>{doc.expectedSections?.length || 0} seções</span>
                    <span className="text-[14px] font-semibold" style={{ color: "#d97757" }}>
                      {isSelected ? "Selecionado" : "Usar este modelo"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="secondary"
            size="md"
          >
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Ampliação do Gabarito Oficial */}
      <Modal
        isOpen={!!previewingDoc}
        onClose={() => {
          setPreviewingDoc(null);
          setModalPageIdx(0);
        }}
        title={`Gabarito Oficial: ${previewingDoc?.label || ""}`}
        description={`${previewingDoc?.category || ""} • Manual de Redação da Unicamp`}
        size="lg"
      >
        <ModalBody>
          <p className="text-[16px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
            {previewingDoc?.description}
          </p>

          {previewingDoc?.competence && (
            <div className="p-3 rounded-[12px]" style={{ backgroundColor: "rgba(217, 119, 87, 0.1)", border: "1px solid rgba(217, 119, 87, 0.3)", color: "#141413" }}>
              <strong>Competência de Expedição:</strong> {previewingDoc.competence}
            </div>
          )}

          {/* Seletor de Página */}
          {previewPages.length > 1 && (
            <div className="flex items-center justify-between p-2 rounded-[12px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
              <span className="text-[14px] font-semibold" style={{ color: "#141413" }}>Páginas do Modelo:</span>
              <div className="flex items-center gap-1.5">
                {previewPages.map((_, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    onClick={() => setModalPageIdx(idx)}
                    variant={modalPageIdx === idx ? "primary" : "secondary"}
                    size="sm"
                  >
                    Página {idx + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Imagem do Gabarito */}
          <div className="relative aspect-[1/1.414] w-full rounded-[24px] overflow-hidden" style={{ border: "1px solid #cccbc8", backgroundColor: "rgba(227, 218, 204, 0.2)" }}>
            {previewPages[modalPageIdx] ? (
              <Image
                src={previewPages[modalPageIdx]}
                alt={`Gabarito de ${previewingDoc?.label || ""} pág. ${modalPageIdx + 1}`}
                fill
                className="object-contain p-2"
                priority
              />
            ) : (
              <div className="p-8 text-center text-[16px] flex items-center justify-center h-full" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#b0aea5" }}>
                Gabarito padrão oficial em conformidade com o Manual de Redação da Unicamp.
              </div>
            )}
          </div>

          {/* Seções Estruturais */}
          {previewingDoc?.expectedSections && (
            <div className="p-3.5 rounded-[24px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <span className="text-[14px] font-semibold block" style={{ color: "#141413", fontFamily: "var(--font-anthropic-sans)" }}>Elementos e Estrutura Oficial:</span>
              <div className="flex flex-wrap gap-1.5">
                {previewingDoc.expectedSections.map((sec, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-[8px] text-[10px]"
                    style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {previewingDoc?.unicampUrl ? (
            <a
              href={previewingDoc.unicampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ghost-link text-[14px] font-semibold flex items-center gap-1 mr-auto"
              style={{ color: "#141413" }}
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: "#d97757" }} />
              <span>Ver página no portal Unicamp</span>
            </a>
          ) : <div />}
          <Button
            type="button"
            onClick={() => {
              if (previewingDoc) {
                onSelectType(previewingDoc.type);
                setPreviewingDoc(null);
                setIsOpen(false);
              }
            }}
            variant="primary"
            size="md"
            leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
          >
            Usar este Modelo ({previewingDoc?.label})
          </Button>
        </ModalFooter>
      </Modal>

      {/* Cartão de Tipo Ativo / Resumo Superior */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px]" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: "#141413", color: "#d97757" }}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "#b0aea5" }}>Modelo Selecionado:</span>
              <span className="text-[14px] font-semibold px-2 py-0.5 rounded-[8px]" style={{ color: "#141413", backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
                {selectedDocInfo.label}
              </span>
            </div>
            <p className="text-[14px] mt-0.5" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              {selectedDocInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedDocInfo.modelImagePath && (
            <Button
              type="button"
              onClick={() => {
                setPreviewingDoc(selectedDocInfo as DocumentTypeMetadata);
                setModalPageIdx(0);
              }}
              variant="secondary"
              size="md"
              leftIcon={<Eye className="w-3.5 h-3.5" style={{ color: "#d97757" }} />}
            >
              Ver Gabarito
            </Button>
          )}

          <Button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            variant="primary"
            size="md"
            rightIcon={isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          >
            {isOpen ? "Recolher Modelos" : "Trocar Modelo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
