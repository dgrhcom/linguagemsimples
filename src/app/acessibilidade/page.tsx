import { Eye, Type, Keyboard, CheckCircle2 } from "lucide-react";

export default function AcessibilidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Recursos de Acessibilidade
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Nossa aplicação foi concebida para atender às diretrizes internacionais de acessibilidade digital (WCAG 2.1 nível AA e e-MAG).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Modo de Alto Contraste</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Permite alternar para uma paleta de alto contraste com fundo preto e tipografia amarela brilhante para facilitar a leitura por pessoas com baixa visão ou fotofobia.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Type className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Redimensionamento de Fontes</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            A barra superior de acessibilidade permite aumentar (A+) ou diminuir (A-) o tamanho de todo o conteúdo textual sem quebrar o layout da página.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Keyboard className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Navegação Total por Teclado</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Todos os botões, links, abas e formulários possuem anéis de foco visíveis e podem ser operados exclusivamente via teclado (Tab, Enter, Espaço e Setas).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Semântica e Leitores de Tela</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Estrutura HTML5 com títulos hierarquizados (h1, h2, h3), marcos de navegação (<code className="bg-slate-100 px-1 py-0.5 rounded">main</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">nav</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">header</code>) e atributos ARIA para tecnologias assistivas.
          </p>
        </div>
      </div>
    </div>
  );
}
