"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import Link from "next/link";

import { safeStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";

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
      className="text-xs font-semibold py-1.5 px-4 transition-colors no-print"
      style={{ backgroundColor: "#1e1d1c", color: "#b0aea5", borderBottom: "1px solid #3d3d3a" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Atalhos Rápidos de Acessibilidade */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="hidden sm:inline font-semibold uppercase" style={{ color: "#d97757", letterSpacing: "0.25em" }}>
            Acessibilidade:
          </span>
          <a
            href="#main-content"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "#b0aea5" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#d97757"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
            title="Ir direto para o conteúdo principal [Alt + 1]"
          >
            Conteúdo [1]
          </a>
          <span style={{ color: "#3d3d3a" }}>|</span>
          <a
            href="#main-nav"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "#b0aea5" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#d97757"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
            title="Ir para o menu de navegação [Alt + 2]"
          >
            Menu [2]
          </a>
          <span style={{ color: "#3d3d3a" }}>|</span>
          <Link
            href="/acessibilidade"
            className="underline underline-offset-2 transition-colors flex items-center gap-1"
            style={{ color: "#b0aea5" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#d97757"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
            title="Ver declaração de acessibilidade e todos os atalhos [Alt + 4]"
          >
            <span>Guia e Atalhos [4]</span>
          </Link>
        </div>

        {/* Ferramentas de Ajuste Visual */}
        <div className="flex items-center gap-3">
          {/* Controle de Tamanho da Fonte */}
          <div className="flex items-center rounded-[8px] p-0.5" style={{ backgroundColor: "#3d3d3a", border: "1px solid #504d4a" }} role="group" aria-label="Ajustar tamanho do texto">
            <button
              onClick={() => handleFontSizeChange(-1)}
              disabled={fontSize === "sm"}
              className="px-2 py-0.5 text-[10px] rounded-[8px] transition-colors"
              style={{ color: fontSize === "sm" ? "#504d4a" : "#b0aea5" }}
              onMouseEnter={(e) => { if (fontSize !== "sm") { e.currentTarget.style.color = "#d97757"; }}}
              onMouseLeave={(e) => { if (fontSize !== "sm") { e.currentTarget.style.color = "#b0aea5"; }}}
              title="Diminuir tamanho da fonte"
              aria-label="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={handleResetFontSize}
              className="px-2 py-0.5 text-[10px] rounded-[8px] transition-colors"
              style={{ color: "#b0aea5" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#d97757"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
              title="Restaurar tamanho padrão da fonte"
              aria-label="Fonte normal"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange(1)}
              disabled={fontSize === "xl"}
              className="px-2 py-0.5 text-[10px] rounded-[8px] transition-colors"
              style={{ color: fontSize === "xl" ? "#504d4a" : "#b0aea5" }}
              onMouseEnter={(e) => { if (fontSize !== "xl") { e.currentTarget.style.color = "#d97757"; }}}
              onMouseLeave={(e) => { if (fontSize !== "xl") { e.currentTarget.style.color = "#b0aea5"; }}}
              title="Aumentar tamanho da fonte"
              aria-label="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Alternador de Alto Contraste */}
          <button
            onClick={toggleHighContrast}
            className="px-3 py-1 text-[10px] font-semibold rounded-[8px] flex items-center gap-1.5 transition-all"
            style={{
              backgroundColor: highContrast ? "#d97757" : "#3d3d3a",
              color: highContrast ? "#141413" : "#b0aea5",
              border: `1px solid ${highContrast ? "#c6613f" : "#504d4a"}`
            }}
            onMouseEnter={(e) => { if (!highContrast) { e.currentTarget.style.borderColor = "#d97757"; e.currentTarget.style.color = "#d97757"; }}}
            onMouseLeave={(e) => { if (!highContrast) { e.currentTarget.style.borderColor = "#504d4a"; e.currentTarget.style.color = "#b0aea5"; }}}
            title="Alternar modo de alto contraste [Alt + 3]"
            aria-pressed={highContrast}
          >
            <Eye className="w-3.5 h-3.5" />
            {highContrast ? "Contraste Ativo" : "Alto Contraste"}
          </button>
        </div>
      </div>
    </aside>
  );
}
