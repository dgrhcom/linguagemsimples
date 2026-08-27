"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityBar } from "./accessibility-bar";
import { SettingsModal } from "./settings-modal";
import { Settings } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { href: "/analisar", label: "Avaliar Texto" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/criterios", label: "Critérios" },
    { href: "/exemplos", label: "Exemplos" },
    { href: "/sobre", label: "Sobre" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-sand no-print">
        <AccessibilityBar />
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-3">
            {/* Logotipo */}
            <Link href="/" className="flex items-center gap-3 group py-1 shrink-0" title="Página Inicial - Linguagem Simples Unicamp">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/linguagem-simples.svg"
                alt="Linguagem Simples - Unicamp"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Navegação Principal — micro-labels editoriais */}
            <nav id="main-nav" className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Menu principal">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 text-micro-label uppercase tracking-micro font-sans transition-colors ${
                      isActive
                        ? "text-ink font-semibold border-l-[3px] border-amber pl-3"
                        : "text-stone hover:text-charcoal hover:bg-sand/40 rounded-btn"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-stone hover:text-ink flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn hover:bg-sand/40 transition-colors"
                title="Configurações de IA"
                aria-label="Configurações de IA"
              >
                <Settings className="w-4 h-4" />
              </button>

              <Link
                href="/analisar"
                className="font-sans text-micro-label uppercase tracking-micro text-charcoal hover:text-ink border-b border-deep-stone hover:border-ink pb-px transition-all"
              >
                Avaliar Texto
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
