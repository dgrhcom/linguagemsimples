import { Eye, Type, Keyboard, CheckCircle2 } from "lucide-react";

export default function AcessibilidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Recursos de Acessibilidade
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Nossa aplicação foi concebida para atender às diretrizes internacionais de acessibilidade digital (WCAG 2.1 nível AA e e-MAG).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-base font-black text-black">Modo de Alto Contraste</h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Permite alternar para uma paleta de alto contraste com fundo preto e tipografia amarela brilhante para facilitar a leitura por pessoas com baixa visão ou fotofobia.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-base font-black text-black">Redimensionamento de Fontes</h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            A barra superior de acessibilidade permite aumentar (A+) ou diminuir (A-) o tamanho de todo o conteúdo textual sem quebrar o layout da página.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-base font-black text-black">Navegação Total por Teclado</h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Todos os botões, links, abas e formulários possuem anéis de foco visíveis e podem ser operados exclusivamente via teclado (Tab, Enter, Espaço e Setas).
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-black text-black">Semântica e Leitores de Tela</h2>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Estrutura HTML5 com títulos hierarquizados (h1, h2, h3), marcos de navegação (<code className="bg-[#faf9f5] border border-zinc-300 px-1.5 py-0.5 rounded text-black font-bold">main</code>, <code className="bg-[#faf9f5] border border-zinc-300 px-1.5 py-0.5 rounded text-black font-bold">nav</code>, <code className="bg-[#faf9f5] border border-zinc-300 px-1.5 py-0.5 rounded text-black font-bold">header</code>) e atributos ARIA para tecnologias assistivas.
          </p>
        </div>
      </div>
    </div>
  );
}
