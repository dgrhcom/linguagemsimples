"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Check,
  Eye,
  X,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DocumentType, DocumentTypeMetadata } from "@/types/document";
import documentTypesData from "@/data/document-types/document-types.json";
import { Button } from "@/components/ui/button";

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
      {/* Modal de Ampliação do Gabarito Oficial com Suporte a Múltiplas Páginas */}
      {previewingDoc && (
        <div className="fixed inset-0 z-60 bg-ink/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper rounded-card p-5 sm:p-6 max-w-3xl w-full border border-slate animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-body font-display text-ink">
                      Gabarito Oficial: {previewingDoc.label}
                    </h3>
                    <span className="text-micro-label bg-amber/10 text-amber-dark px-2 py-0.5 rounded-btn border border-amber/30">
                      {previewingDoc.category}
                    </span>
                  </div>
                  <span className="text-micro-label text-stone">
                    Manual de Redação da Unicamp • linguagemsimples.unicamp.br
                  </span>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setPreviewingDoc(null);
                  setModalPageIdx(0);
                }}
                variant="ghost"
                size="sm"
                className="p-2"
                leftIcon={<X className="w-5 h-5" />}
              />
            </div>

            {/* Conteúdo Rolável */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <p className="text-body-sm text-charcoal leading-relaxed">
                {previewingDoc.description}
              </p>

              {previewingDoc.competence && (
                <div className="bg-amber/10 border border-amber/30 rounded-tile p-2.5 text-body-sm text-ink">
                  <strong>Competência de Expedição:</strong> {previewingDoc.competence}
                </div>
              )}

              {/* Seletor de Página se o documento tiver mais de 1 página */}
              {previewPages.length > 1 && (
                <div className="flex items-center justify-between bg-sand/50 p-2 rounded-tile border border-sand text-body-sm">
                  <span className="font-semibold text-ink">Páginas do Modelo:</span>
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

              {/* Imagem do Gabarito Oficial */}
              <div className="relative aspect-[1/1.414] w-full border border-sand rounded-card overflow-hidden bg-sand/20">
                {previewPages[modalPageIdx] ? (
                  <Image
                    src={previewPages[modalPageIdx]}
                    alt={`Gabarito de ${previewingDoc.label} pág. ${modalPageIdx + 1}`}
                    fill
                    className="object-contain p-2"
                    priority
                  />
                ) : (
                  <div className="p-8 text-center text-body-sm text-stone flex items-center justify-center h-full">
                    Gabarito padrão oficial em conformidade com o Manual de Redação da Unicamp.
                  </div>
                )}
              </div>

              {/* Seções Estruturais Oficiais */}
              {previewingDoc.expectedSections && (
                <div className="bg-sand/30 border border-sand rounded-card p-3.5 space-y-2 text-body-sm">
                  <span className="font-semibold text-ink block">Elementos e Estrutura Oficial:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewingDoc.expectedSections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="bg-paper border border-sand text-charcoal px-2.5 py-1 rounded-btn text-micro-label"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-sand">
              {previewingDoc.unicampUrl ? (
                <a
                  href={previewingDoc.unicampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-body-sm text-ink font-semibold flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber" />
                  <span>Ver página no portal Unicamp</span>
                </a>
              ) : (
                <div />
              )}

              <Button
                type="button"
                onClick={() => {
                  onSelectType(previewingDoc.type);
                  setPreviewingDoc(null);
                  setIsOpen(false);
                }}
                variant="primary"
                size="md"
                leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
              >
                Usar este Modelo ({previewingDoc.label})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cartão de Tipo Ativo / Resumo Superior */}
      <div className="bg-paper border border-sand rounded-card p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-tile bg-ink text-amber flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-micro-label text-stone">
                Modelo Selecionado:
              </span>
              <span className="text-body-sm font-semibold text-ink bg-sand/50 border border-sand px-2 py-0.5 rounded-btn">
                {selectedDocInfo.label}
              </span>
            </div>
            <p className="text-body-sm text-charcoal line-clamp-1 max-w-xl mt-0.5">
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
              leftIcon={<Eye className="w-3.5 h-3.5 text-amber" />}
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

      {/* Grade de Cards Expansível de Todos os 21 Modelos */}
      {isOpen && (
        <div className="bg-paper border border-sand rounded-card p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-98 duration-200">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-sand pb-3">
            {/* Abas de Categorias */}
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
                  <span className="text-micro-label opacity-60 px-1.5 py-0.2">
                    {cat.count}
                  </span>
                </Button>
              ))}
            </div>

            {/* Campo de Busca */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo oficial..."
                className="w-full text-body-sm pl-8 pr-3 py-1.5 bg-paper-light border border-sand rounded-input focus:bg-white focus:ring-1 focus:ring-deep-stone outline-hidden"
              />
            </div>
          </div>

          {/* Grade de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = selectedType === doc.type;
              return (
                <div
                  key={doc.type}
                  onClick={() => {
                    onSelectType(doc.type);
                    setIsOpen(false);
                  }}
                  className={`relative text-left p-3.5 rounded-card border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "bg-amber/10 border-amber/40 ring-1 ring-amber/30"
                      : "bg-paper border-sand hover:border-deep-stone hover:bg-sand/20"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Topo do Card: Categoria e Botão de Gabarito */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-micro-label text-stone">
                        {doc.category}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-ink text-amber flex items-center justify-center font-bold shrink-0">
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
                            className="text-micro-label text-stone hover:text-ink hover:bg-sand p-1 rounded-btn transition-colors flex items-center gap-1"
                            title="Ver gabarito da Unicamp"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber" />
                          </button>
                        )
                      )}
                    </div>

                    {/* Título do Documento */}
                    <h4 className="text-body-sm font-semibold text-ink group-hover:text-amber-dark transition-colors">
                      {doc.label}
                    </h4>

                    {/* Descrição */}
                    <p className="text-micro-label text-charcoal line-clamp-2 leading-relaxed font-normal">
                      {doc.description}
                    </p>
                  </div>

                  {/* Rodapé do Card com Ação Rápida */}
                  <div className="mt-3 pt-2 border-t border-sand flex items-center justify-between">
                    <span className="text-micro-label text-stone">
                      {doc.expectedSections?.length || 0} seções
                    </span>
                    <span className="text-body-sm font-semibold text-amber-dark group-hover:underline">
                      {isSelected ? "Selecionado" : "Usar este modelo"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
