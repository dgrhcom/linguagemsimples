"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ExternalLink } from "lucide-react";

export function AccessibilityBar() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");

  useEffect(() => {
    // Carrega preferências do localStorage
    try {
      const savedContrast = localStorage.getItem("high_contrast") === "true";
      const savedSize = (localStorage.getItem("font_size") as "sm" | "md" | "lg" | "xl") || "md";

      setHighContrast(savedContrast);
      setFontSize(savedSize);

      applyContrast(savedContrast);
      applyFontSize(savedSize);
    } catch (e) {
      console.error(e);
    }

    // Atalhos de teclado (Alt + 1, Alt + 2, Alt + 3, Alt + 4)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        document.getElementById("main-content")?.focus();
      } else if (e.altKey && e.key === "2") {
        e.preventDefault();
        document.getElementById("main-nav")?.focus();
      } else if (e.altKey && e.key === "3") {
        e.preventDefault();
        document.getElementById("main-footer")?.focus();
      } else if (e.altKey && e.key === "4") {
        e.preventDefault();
        toggleHighContrast();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highContrast, fontSize]);

  const applyContrast = (contrast: boolean) => {
    if (contrast) {
      document.documentElement.setAttribute("data-high-contrast", "true");
    } else {
      document.documentElement.removeAttribute("data-high-contrast");
    }
  };

  const applyFontSize = (size: "sm" | "md" | "lg" | "xl") => {
    document.documentElement.setAttribute("data-font-size", size);
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try {
      localStorage.setItem("high_contrast", String(next));
    } catch (e) {}
    applyContrast(next);
  };

  const increaseFont = () => {
    const order: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
    const currIndex = order.indexOf(fontSize);
    if (currIndex < order.length - 1) {
      const next = order[currIndex + 1];
      setFontSize(next);
      try {
        localStorage.setItem("font_size", next);
      } catch (e) {}
      applyFontSize(next);
    }
  };

  const decreaseFont = () => {
    const order: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
    const currIndex = order.indexOf(fontSize);
    if (currIndex > 0) {
      const next = order[currIndex - 1];
      setFontSize(next);
      try {
        localStorage.setItem("font_size", next);
      } catch (e) {}
      applyFontSize(next);
    }
  };

  const resetFont = () => {
    setFontSize("md");
    try {
      localStorage.setItem("font_size", "md");
    } catch (e) {}
    applyFontSize("md");
  };

  return (
    <div className="bg-[#353c43] text-white text-[11px] py-1 px-4 border-b border-[#2b3035] flex justify-between items-center no-print">
      {/* Atalhos Institucionais Unicamp */}
      <div className="flex items-center gap-3 sm:gap-5">
        <a
          href="#main-content"
          className="text-slate-200 hover:text-white underline-offset-2 hover:underline focus:bg-[#c2383f] focus:text-white focus:px-2 focus:py-0.5 focus:rounded"
        >
          Conteúdo principal <span className="text-slate-400 font-mono">[1]</span>
        </a>
        <a
          href="#main-nav"
          className="hidden sm:inline text-slate-200 hover:text-white underline-offset-2 hover:underline focus:bg-[#c2383f] focus:text-white focus:px-2 focus:py-0.5 focus:rounded"
        >
          Menu principal <span className="text-slate-400 font-mono">[2]</span>
        </a>
        <a
          href="#main-footer"
          className="hidden md:inline text-slate-200 hover:text-white underline-offset-2 hover:underline focus:bg-[#c2383f] focus:text-white focus:px-2 focus:py-0.5 focus:rounded"
        >
          Rodapé <span className="text-slate-400 font-mono">[3]</span>
        </a>
      </div>

      {/* Controles de Acessibilidade: Alto Contraste & Tamanho da Fonte */}
      <div className="flex items-center gap-3">
        {/* Controle de Fonte */}
        <div className="flex items-center bg-[#252a2e] rounded-md p-0.5" role="group" aria-label="Ajuste do tamanho da fonte">
          <button
            onClick={decreaseFont}
            title="Diminuir o tamanho da letra"
            aria-label="Diminuir texto (A-)"
            className="px-2 py-0.5 hover:bg-[#353c43] text-slate-200 hover:text-white rounded text-[11px] font-bold transition-colors"
          >
            A-
          </button>
          <button
            onClick={resetFont}
            title="Tamanho padrão da letra"
            aria-label="Tamanho padrão (A)"
            className="px-2 py-0.5 hover:bg-[#353c43] text-slate-200 hover:text-white rounded text-[11px] font-bold transition-colors border-x border-slate-600/40"
          >
            A
          </button>
          <button
            onClick={increaseFont}
            title="Aumentar o tamanho da letra"
            aria-label="Aumentar texto (A+)"
            className="px-2 py-0.5 hover:bg-[#353c43] text-slate-200 hover:text-white rounded text-[11px] font-bold transition-colors"
          >
            A+
          </button>
        </div>

        {/* Alto Contraste */}
        <button
          onClick={toggleHighContrast}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
            highContrast
              ? "bg-[#ffff00] text-black font-bold"
              : "bg-[#252a2e] hover:bg-[#353c43] text-slate-200 hover:text-white"
          }`}
          title="Alternar modo de Alto Contraste [Alt + 4]"
          aria-pressed={highContrast}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Alto Contraste</span>
        </button>

        {/* Link Unicamp */}
        <a
          href="https://www.unicamp.br"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-white pl-2 border-l border-slate-600"
        >
          <span>unicamp.br</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
