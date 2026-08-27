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
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl border border-zinc-200 animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FBB040] text-black flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-black">
                      Gabarito Oficial: {previewingDoc.label}
                    </h3>
                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-[#b36b00] px-2 py-0.5 rounded-md border border-amber-300">
                      {previewingDoc.category}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    Manual de Redação da Unicamp • linguagemsimples.unicamp.br
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewingDoc(null);
                  setModalPageIdx(0);
                }}
                className="p-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Rolável */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <p className="text-xs text-zinc-700 leading-relaxed">
                {previewingDoc.description}
              </p>

              {previewingDoc.competence && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 text-xs text-zinc-800">
                  <strong>Competência de Expedição:</strong> {previewingDoc.competence}
                </div>
              )}

              {/* Seletor de Página se o documento tiver mais de 1 página */}
              {previewPages.length > 1 && (
                <div className="flex items-center justify-between bg-zinc-100 p-2 rounded-xl border border-zinc-200 text-xs">
                  <span className="font-bold text-zinc-800">Páginas do Modelo:</span>
                  <div className="flex items-center gap-1.5">
                    {previewPages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalPageIdx(idx)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                          modalPageIdx === idx
                            ? "bg-[#FBB040] text-black shadow-xs border border-[#d98a1a]"
                            : "bg-white text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        Página {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Imagem do Gabarito Oficial */}
              <div className="relative aspect-[1/1.414] w-full border border-zinc-300 rounded-2xl overflow-hidden bg-zinc-50 shadow-inner">
                {previewPages[modalPageIdx] ? (
                  <Image
                    src={previewPages[modalPageIdx]}
                    alt={`Gabarito de ${previewingDoc.label} pág. ${modalPageIdx + 1}`}
                    fill
                    className="object-contain p-2"
                    priority
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center h-full">
                    Gabarito padrão oficial em conformidade com o Manual de Redação da Unicamp.
                  </div>
                )}
              </div>

              {/* Seções Estruturais Oficiais */}
              {previewingDoc.expectedSections && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-2 text-xs">
                  <span className="font-bold text-black block">Elementos e Estrutura Oficial:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewingDoc.expectedSections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-zinc-300 text-zinc-800 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-2xs"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
              {previewingDoc.unicampUrl ? (
                <a
                  href={previewingDoc.unicampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#b36b00] hover:underline flex items-center gap-1 font-bold"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver página no portal Unicamp</span>
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => {
                  onSelectType(previewingDoc.type);
                  setPreviewingDoc(null);
                  setIsOpen(false);
                }}
                className="bg-[#FBB040] hover:bg-[#e59b2b] text-black font-black text-xs px-5 py-2.5 rounded-xl border border-[#d98a1a] shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Usar este Modelo ({previewingDoc.label})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cartão de Tipo Ativo / Resumo Superior */}
      <div className="bg-[#faf9f5] border border-zinc-200 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FBB040] text-black flex items-center justify-center font-bold shadow-xs shrink-0">
            <FileText className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                Modelo Selecionado:
              </span>
              <span className="text-xs font-black text-black bg-white border border-zinc-300 px-2 py-0.5 rounded-md">
                {selectedDocInfo.label}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-normal line-clamp-1 max-w-xl mt-0.5">
              {selectedDocInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedDocInfo.modelImagePath && (
            <button
              type="button"
              onClick={() => {
                setPreviewingDoc(selectedDocInfo as DocumentTypeMetadata);
                setModalPageIdx(0);
              }}
              className="text-xs font-bold text-zinc-700 hover:text-black bg-white border border-zinc-300 hover:bg-zinc-100 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#d98a1a]" />
              <span>Ver Gabarito</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-black text-black bg-[#FBB040] hover:bg-[#e59b2b] px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 border border-[#d98a1a]"
          >
            <span>{isOpen ? "Recolher Modelos" : "Trocar Modelo"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Grade de Cards Expansível de Todos os 21 Modelos */}
      {isOpen && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-200">
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            {/* Abas de Categorias */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? "bg-[#18181b] text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Campo de Busca */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo oficial..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FBB040] outline-hidden"
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
                  className={`relative text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                    isSelected
                      ? "bg-amber-50/70 border-[#FBB040] ring-2 ring-[#FBB040]/30 shadow-xs"
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Topo do Card: Categoria e Botão de Gabarito */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {doc.category}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#FBB040] text-black flex items-center justify-center font-bold shrink-0">
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
                            className="text-[10px] text-zinc-500 hover:text-black hover:bg-zinc-200 p-1 rounded-md transition-colors flex items-center gap-1"
                            title="Ver gabarito da Unicamp"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#d98a1a]" />
                          </button>
                        )
                      )}
                    </div>

                    {/* Título do Documento */}
                    <h4 className="text-xs font-black text-black group-hover:text-[#b36b00] transition-colors">
                      {doc.label}
                    </h4>

                    {/* Descrição */}
                    <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                      {doc.description}
                    </p>
                  </div>

                  {/* Rodapé do Card com Ação Rápida */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {doc.expectedSections?.length || 0} seções
                    </span>
                    <span className="text-[11px] font-bold text-[#b36b00] group-hover:underline">
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
