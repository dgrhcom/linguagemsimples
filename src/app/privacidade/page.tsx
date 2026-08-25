import { ShieldCheck, Lock, Database, EyeOff } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          Privacidade e Transparência de Dados
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Como ferramenta pública voltada à cidadania e à administração pública, assumimos compromissos rígidos com a confidencialidade das suas informações.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-black">Zero Armazenamento de Textos</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
            Os textos submetidos para avaliação são processados exclusivamente na memória volátil durante a requisição e <strong>nunca são salvos em nenhum banco de dados ou disco</strong>.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-black">Não Utilização para Treinamento de Modelos</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
            Nenhuma informação pessoal, administrativa ou minuta institucional enviada através desta ferramenta é retida ou utilizada para treinar modelos de inteligência artificial de terceiros.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#FBB040] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#18181b] text-[#FBB040] flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-black">Não Exigência de Cadastro</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
            A ferramenta é de acesso público, livre e anônimo, não exigindo criação de conta, login ou fornecimento de e-mail para realização de análises completas.
          </p>
        </div>
      </div>
    </div>
  );
}
