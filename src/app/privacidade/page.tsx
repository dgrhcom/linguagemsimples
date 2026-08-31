import { ShieldCheck, Lock, Database, EyeOff } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[80px] space-y-[80px]">
      <div className="text-center space-y-3">
        <h1 className="font-sans text-[61px] leading-[1.1] tracking-[-0.12px]" style={{ color: "#141413" }}>
          Privacidade e Transparência de Dados
        </h1>
        <p className="text-[20px] leading-[1.4] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
          Como ferramenta pública voltada à cidadania e à administração pública, assumimos compromissos rígidos com a confidencialidade das suas informações.
        </p>
      </div>

      <div className="space-y-6">
        {[
          { icon: Database, title: "Zero Armazenamento de Textos", desc: "Os textos submetidos para avaliação são processados exclusivamente na memória volátil durante a requisição e nunca são salvos em nenhum banco de dados ou disco." },
          { icon: Lock, title: "Não Utilização para Treinamento de Modelos", desc: "Nenhuma informação pessoal, administrativa ou minuta institucional enviada através desta ferramenta é retida ou utilizada para treinar modelos de inteligência artificial de terceiros." },
          { icon: EyeOff, title: "Não Exigência de Cadastro", desc: "A ferramenta é de acesso público, livre e anônimo, não exigindo criação de conta, login ou fornecimento de e-mail para realização de análises completas." }
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] p-6 sm:p-7 space-y-3 transition-all" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-bold" style={{ backgroundColor: "#141413", color: "#d97757" }}>
                <item.icon className="w-5 h-5" />
              </div>
              <h2 className="text-[20px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>{item.title}</h2>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
