import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight, BookOpen, AlertCircle, Eye } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Como funciona a ferramenta?
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Entenda como seu texto é analisado passo a passo e conheça o compromisso de transparência do nosso motor metodológico.
        </p>
      </div>

      {/* Passo a Passo */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-black flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#FBB040]" />
          <span>O Ciclo de Avaliação em 6 Passos</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">1</span>
            <h3 className="font-black text-black text-sm">Cole ou envie seu texto</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Insira seu comunicado, e-mail, ofício, relatório ou texto geral na área de edição.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">2</span>
            <h3 className="font-black text-black text-sm">Informe quem vai ler (Opcional)</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Indicar o público-alvo e o objetivo ajuda a calibrar o nível de vocabulário e a avaliar se termos técnicos são adequados.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">3</span>
            <h3 className="font-black text-black text-sm">A ferramenta analisa o conteúdo</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              O motor híbrido cruza regras determinísticas da Unicamp e inteligência contextual para identificar frases longas, jargões, arcaísmos e formas excludentes.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">4</span>
            <h3 className="font-black text-black text-sm">Você entende os problemas</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Cada apontamento explica <em>por que</em> o trecho precisa ser melhorado e cita a diretriz correspondente da Unicamp.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">5</span>
            <h3 className="font-black text-black text-sm">Decida quais sugestões aceitar</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Você tem total controle para aceitar uma sugestão, aplicar em lote ou editar manualmente.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-xl bg-[#18181b] text-[#FBB040] font-black text-xs flex items-center justify-center">6</span>
            <h3 className="font-black text-black text-sm">Exporte o resultado</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-medium">
              Baixe a versão revisada ou o relatório completo em DOCX, PDF, Markdown, HTML ou TXT.
            </p>
          </div>
        </div>
      </div>

      {/* Transparência e Uso da IA */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6">
        <h2 className="text-xl font-black text-black flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#FBB040]" />
          <span>Transparência: Como a Inteligência Artificial é Utilizada?</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <p className="font-medium">
            A inteligência artificial funciona como uma <strong>assistente de apoio à redação</strong>, e não como um substituto do julgamento humano.
          </p>
          
          <div className="bg-[#faf9f5] p-5 rounded-2xl border border-zinc-200 space-y-2">
            <strong className="text-black block font-bold text-sm">1. Separação de Regras e IA:</strong>
            <p className="text-xs text-zinc-600 font-medium">
              Regras objetivas (contagem de palavras, frases &gt; 20 palavras, fórmulas obsoletas como &ldquo;DD./Ilmo.&rdquo;, grafia de horas e dicionários) são avaliadas por um motor determinístico rigoroso baseado na Unicamp. A IA é acionada apenas para interpretação contextual e reescrita fluida.
            </p>
          </div>

          <div className="bg-[#faf9f5] p-5 rounded-2xl border border-zinc-200 space-y-2">
            <strong className="text-black block font-bold text-sm">2. Preservação Semântica e Não Reducionismo:</strong>
            <p className="text-xs text-zinc-600 font-medium">
              A simplificação nunca deve omitir obrigações, prazos, condições jurídicas, valores ou referências normativas. Nosso pipeline valida semanticamente se nenhum dado essencial foi alterado.
            </p>
          </div>

          <div className="bg-[#faf9f5] p-5 rounded-2xl border border-zinc-200 space-y-2">
            <strong className="text-black block font-bold text-sm">3. Responsabilidade Final do Emissor:</strong>
            <p className="text-xs text-zinc-600 font-medium">
              Toda sugestão gerada pela ferramenta deve ser revisada por quem assina ou publica o documento antes da divulgação final.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/analisar"
          className="inline-flex items-center gap-2 bg-[#FBB040] hover:bg-[#e59b2b] text-[#111111] font-black text-sm px-7 py-3.5 rounded-2xl shadow-sm transition-all border border-[#d98a1a]"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Experimentar Agora no Analisador</span>
        </Link>
      </div>
    </div>
  );
}
