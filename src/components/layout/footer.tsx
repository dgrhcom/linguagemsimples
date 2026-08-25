import Link from "next/link";
import { BookOpen, ExternalLink, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer id="main-footer" className="bg-[#18181b] text-zinc-300 text-sm mt-auto border-t border-zinc-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 text-white font-black text-lg mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="bg-white px-2.5 py-1.5 rounded-xl border border-zinc-700">
                <img
                  src="/images/linguagem-simples.svg"
                  alt="Linguagem Simples Unicamp"
                  className="h-7 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              Uma ferramenta pública de apoio à redação oficial para transformar a comunicação em uma experiência clara, direta e acessível, fundamentada nas diretrizes do <strong>Projeto Linguagem Simples e Inclusiva da Unicamp</strong>.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#FBB040]">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacidade garantida: seus textos não são armazenados.</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/analisar" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Avaliar Texto
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/criterios" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Critérios e Regras
                </Link>
              </li>
              <li>
                <Link href="/exemplos" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Exemplos Antes/Depois
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Metodologia Unicamp</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://linguagemsimples.unicamp.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors text-[#FBB040] hover:underline"
                >
                  <span>Portal Oficial Unicamp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/acessibilidade" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Acessibilidade (WCAG AA)
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Privacidade e Transparência
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-[#FBB040] hover:underline transition-colors">
                  Sobre o Projeto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4">
          <p>
            Universidade Estadual de Campinas • Coordenadoria Geral da Universidade (CGU) & Educorp
          </p>
          <p className="flex items-center gap-1 text-zinc-400">
            <span>Comunicação simples para todas e todos</span>
            <Heart className="w-3.5 h-3.5 text-[#FBB040] fill-[#FBB040]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
