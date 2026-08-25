"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityBar } from "./accessibility-bar";
import { SettingsModal } from "./settings-modal";
import { CheckCircle2, Sparkles, HelpCircle, FileText, Info, Settings, Cpu } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { href: "/analisar", label: "AVALIE SEU TEXTO", icon: Sparkles },
    { href: "/como-funciona", label: "COMO FUNCIONA", icon: HelpCircle },
    { href: "/criterios", label: "CRITÉRIOS E REGRAS", icon: CheckCircle2 },
    { href: "/exemplos", label: "EXEMPLOS ANTES/DEPOIS", icon: FileText },
    { href: "/sobre", label: "SOBRE O PROJETO", icon: Info }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#e8e5dc] shadow-2xs no-print">
        <AccessibilityBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logotipo Unicamp LinguagemSimples */}
            <Link href="/" className="flex items-center gap-3.5 group py-2">
              <div className="w-11 h-11 rounded-xl bg-[#18181b] border-2 border-[#FBB040] flex items-center justify-center text-[#FBB040] font-black shadow-xs group-hover:bg-black transition-colors">
                <span className="text-xl font-black tracking-tighter">LS</span>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#18181b] tracking-tight leading-none">
                  <span>Linguagem</span>
                  <span className="text-[#FBB040] ml-1 px-1 bg-[#18181b] rounded-md inline-block">Simples</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block mt-1">
                  Universidade Estadual de Campinas
                </span>
              </div>
            </Link>

            {/* Navegação Principal */}
            <nav id="main-nav" className="hidden lg:flex items-center gap-1" aria-label="Menu principal">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all relative ${
                      isActive
                        ? "text-[#18181b] font-black after:content-[''] after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[3px] after:bg-[#FBB040]"
                        : "text-zinc-600 hover:text-black hover:bg-[#faf9f5] rounded-lg"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-[#faf9f5] hover:bg-zinc-100 text-zinc-700 hover:text-black transition-colors"
                title="Configurações de Inteligência Artificial (API Keys)"
                aria-label="Configurações de IA"
              >
                <Settings className="w-4 h-4" />
              </button>

              <Link
                href="/analisar"
                className="bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 border border-[#d98a1a]"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Avaliar Texto</span>
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
