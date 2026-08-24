import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight, BookOpen, AlertCircle, Eye } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Como funciona a ferramenta?
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Entenda como seu texto é analisado passo a passo e conheça o compromisso de transparência do nosso motor metodológico.
        </p>
      </div>

      {/* Passo a Passo */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>O Ciclo de Avaliação em 6 Passos</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="font-bold text-slate-900 text-sm">Cole ou envie seu texto</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Insira seu comunicado, e-mail, ofício, relatório ou texto geral na área de edição.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="font-bold text-slate-900 text-sm">Informe quem vai ler (Opcional)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Indicar o público-alvo e o objetivo ajuda a calibrar o nível de vocabulário e a avaliar se termos técnicos são adequados.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="font-bold text-slate-900 text-sm">A ferramenta analisa o conteúdo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O motor híbrido cruza regras determinísticas da Unicamp e inteligência contextual para identificar frases longas, jargões, arcaísmos e formas excludentes.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">4</span>
            <h3 className="font-bold text-slate-900 text-sm">Você entende os problemas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada apontamento explica <em>por que</em> o trecho precisa ser melhorado e cita a diretriz correspondente da Unicamp.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5</span>
            <h3 className="font-bold text-slate-900 text-sm">Decida quais sugestões aceitar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem total controle para aceitar uma sugestão, aplicar em lote ou editar manualmente.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">6</span>
            <h3 className="font-bold text-slate-900 text-sm">Exporte o resultado</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Baixe a versão revisada ou o relatório completo em DOCX, PDF, Markdown, HTML ou TXT.
            </p>
          </div>
        </div>
      </div>

      {/* Transparência e Uso da IA */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span>Transparência: Como a Inteligência Artificial é Utilizada?</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            A inteligência artificial funciona como uma <strong>assistente de apoio à redação</strong>, e não como um substituto do julgamento humano.
          </p>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 block font-semibold">1. Separação de Regras e IA:</strong>
            <p className="text-xs text-slate-600">
              Regras objetivas (contagem de palavras, frases &gt; 20 palavras, fórmulas obsoletas como &ldquo;DD./Ilmo.&rdquo;, grafia de horas e dicionários) são avaliadas por um motor determinístico rigoroso baseado na Unicamp. A IA é acionada apenas para interpretação contextual e reescrita fluida.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 block font-semibold">2. Preservação Semântica e Não Reducionismo:</strong>
            <p className="text-xs text-slate-600">
              A simplificação nunca deve omitir obrigações, prazos, condições jurídicas, valores ou referências normativas. Nosso pipeline valida semanticamente se nenhum dado essencial foi alterado.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 block font-semibold">3. Responsabilidade Final do Emissor:</strong>
            <p className="text-xs text-slate-600">
              Toda sugestão gerada pela ferramenta deve ser revisada por quem assina ou publica o documento antes da divulgação final.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/analisar"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Experimentar Agora no Analisador</span>
        </Link>
      </div>
    </div>
  );
}
