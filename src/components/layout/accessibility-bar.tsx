"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";

import { safeStorage } from "@/lib/storage";

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const savedFontSize = (safeStorage.getItem("font_size") as "sm" | "md" | "lg" | "xl") || "md";
      const savedHighContrast = safeStorage.getItem("high_contrast") === "true";
      setFontSize(savedFontSize);
      setHighContrast(savedHighContrast);
      document.documentElement.setAttribute("data-font-size", savedFontSize);
      document.documentElement.setAttribute("data-high-contrast", String(savedHighContrast));
    } catch (e) {}
  }, []);

  const handleFontSizeChange = (delta: number) => {
    const sizes: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
    const currentIndex = sizes.indexOf(fontSize);
    const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + delta));
    const newSize = sizes[newIndex];
    setFontSize(newSize);
    document.documentElement.setAttribute("data-font-size", newSize);
    safeStorage.setItem("font_size", newSize);
  };

  const handleResetFontSize = () => {
    setFontSize("md");
    document.documentElement.setAttribute("data-font-size", "md");
    safeStorage.setItem("font_size", "md");
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.setAttribute("data-high-contrast", String(next));
    safeStorage.setItem("high_contrast", String(next));
  };


  return (
    <aside
      aria-label="Barra de Acessibilidade"
      className="bg-[#18181b] text-slate-200 border-b border-zinc-800 text-xs font-semibold py-1.5 px-4 transition-colors no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Atalhos Rápidos de Acessibilidade */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-300">
          <span className="hidden sm:inline text-[#FBB040] font-black uppercase tracking-wider">
            Acessibilidade:
          </span>
          <a
            href="#main-content"
            className="hover:text-[#FBB040] underline underline-offset-2 transition-colors"
            title="Ir direto para o conteúdo principal [Alt + 1]"
          >
            Conteúdo [1]
          </a>
          <span className="text-zinc-600">|</span>
          <a
            href="#main-nav"
            className="hover:text-[#FBB040] underline underline-offset-2 transition-colors"
            title="Ir para o menu de navegação [Alt + 2]"
          >
            Menu [2]
          </a>
          <span className="text-zinc-600">|</span>
          <Link
            href="/acessibilidade"
            className="hover:text-[#FBB040] underline underline-offset-2 transition-colors flex items-center gap-1"
            title="Ver declaração de acessibilidade e todos os atalhos [Alt + 4]"
          >
            <span>Guia e Atalhos [4]</span>
          </Link>
        </div>

        {/* Ferramentas de Ajuste Visual */}
        <div className="flex items-center gap-3">
          {/* Controle de Tamanho da Fonte */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5" role="group" aria-label="Ajustar tamanho do texto">
            <button
              onClick={() => handleFontSizeChange(-1)}
              disabled={fontSize === "sm"}
              className="px-2 py-0.5 text-[11px] font-bold text-zinc-300 hover:text-[#FBB040] hover:bg-zinc-800 rounded disabled:opacity-40 transition-colors"
              title="Diminuir tamanho da fonte"
              aria-label="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={handleResetFontSize}
              className="px-2 py-0.5 text-[11px] font-bold text-zinc-300 hover:text-[#FBB040] hover:bg-zinc-800 rounded transition-colors"
              title="Restaurar tamanho padrão da fonte"
              aria-label="Fonte normal"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange(1)}
              disabled={fontSize === "xl"}
              className="px-2 py-0.5 text-[11px] font-bold text-zinc-300 hover:text-[#FBB040] hover:bg-zinc-800 rounded disabled:opacity-40 transition-colors"
              title="Aumentar tamanho da fonte"
              aria-label="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Alternador de Alto Contraste */}
          <button
            onClick={toggleHighContrast}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
              highContrast
                ? "bg-[#FBB040] text-black border-[#FBB040] shadow-xs"
                : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-[#FBB040] hover:text-[#FBB040]"
            }`}
            title="Alternar modo de alto contraste [Alt + 3]"
            aria-pressed={highContrast}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{highContrast ? "Contraste Ativo" : "Alto Contraste"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
