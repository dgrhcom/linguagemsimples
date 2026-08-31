"use client";

import { useState, useEffect } from "react";
import { Check, X, Cpu, ExternalLink } from "lucide-react";
import { safeStorage } from "@/lib/storage";
import { Button } from "@/components/ui/button";


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function SettingsModal({ isOpen, onClose, onSaved }: SettingsModalProps) {
  const [provider, setProvider] = useState<"gemini" | "openai" | "offline">("offline");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const storedGemini = safeStorage.getItem("custom_gemini_api_key") || "";
      const storedOpenAI = safeStorage.getItem("custom_openai_api_key") || "";
      const storedProvider = (safeStorage.getItem("preferred_ai_provider") as any) || (storedGemini ? "gemini" : storedOpenAI ? "openai" : "offline");

      setGeminiKey(storedGemini);
      setOpenaiKey(storedOpenAI);
      setProvider(storedProvider);
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      let finalProvider = provider;
      if (geminiKey.trim() && provider === "offline") {
        finalProvider = "gemini";
      } else if (openaiKey.trim() && provider === "offline") {
        finalProvider = "openai";
      }

      safeStorage.setItem("preferred_ai_provider", finalProvider);
      if (geminiKey.trim()) {
        safeStorage.setItem("custom_gemini_api_key", geminiKey.trim());
      } else {
        safeStorage.removeItem("custom_gemini_api_key");
      }

      if (openaiKey.trim()) {
        safeStorage.setItem("custom_openai_api_key", openaiKey.trim());
      } else {
        safeStorage.removeItem("custom_openai_api_key");
      }

      setSavedSuccess(true);

      if (onSaved) onSaved();
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(20, 20, 19, 0.6)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-[24px] max-w-lg w-full overflow-hidden" style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8" }}>
        {/* Topo */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#141413", borderBottom: "1px solid #3d3d3a" }}>
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5" style={{ color: "#d97757" }} />
            <h3 className="text-[20px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#faf9f5" }}>Configurações de IA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] transition-colors"
            style={{ color: "#b0aea5" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#faf9f5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#b0aea5"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5 text-[14px]" style={{ color: "#141413" }}>
          <div className="p-4 rounded-[12px] space-y-2" style={{ backgroundColor: "rgba(227, 218, 204, 0.5)", border: "1px solid #cccbc8" }}>
            <p className="text-[14px] leading-relaxed" style={{ fontFamily: "var(--font-anthropic-serif)", color: "#141413" }}>
              A ferramenta funciona <strong>100% offline</strong> utilizando o motor determinístico da Unicamp. Para reescritas contextuais, configure uma chave de API gratuita do <strong>Google Gemini</strong> ou da <strong>OpenAI</strong>.
            </p>
          </div>

          {/* Seleção de Modo */}
          <div className="space-y-2">
            <label className="text-[14px] block" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>Motor de IA:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "gemini" as const, label: "Google Gemini", sub: "Recomendado (Grátis)" },
                { id: "openai" as const, label: "OpenAI GPT", sub: "GPT-4o mini" },
                { id: "offline" as const, label: "Motor Unicamp", sub: "Offline / Local" },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className="p-3 rounded-[12px] text-left transition-colors"
                  style={{
                    backgroundColor: provider === opt.id ? "#141413" : "#faf9f5",
                    color: provider === opt.id ? "#faf9f5" : "#141413",
                    border: `1px solid ${provider === opt.id ? "#3d3d3a" : "#cccbc8"}`
                  }}
                >
                  <div className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-sans)" }}>{opt.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: provider === opt.id ? "#b0aea5" : "#b0aea5" }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Chave Gemini */}
          {provider === "gemini" && (
            <div className="space-y-2 p-4 rounded-[12px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <div className="flex justify-between items-center">
                <label className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>Chave de API do Google Gemini:</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-[12px] flex items-center gap-1"
                  style={{ color: "#141413" }}
                >
                  <span>Obter chave</span>
                  <ExternalLink className="w-3 h-3" style={{ color: "#d97757" }} />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-[8px] px-3 py-2 text-[14px] font-mono focus:ring-1 outline-hidden"
                style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}
              />
              <span className="text-[10px] block" style={{ color: "#b0aea5" }}>
                Sua chave fica salva apenas no navegador (localStorage).
              </span>
            </div>
          )}

          {/* Campo de Chave OpenAI */}
          {provider === "openai" && (
            <div className="space-y-2 p-4 rounded-[12px]" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8" }}>
              <div className="flex justify-between items-center">
                <label className="text-[14px]" style={{ fontFamily: "var(--font-anthropic-sans)", color: "#141413" }}>Chave de API da OpenAI:</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-[12px] flex items-center gap-1"
                  style={{ color: "#141413" }}
                >
                  <span>Obter na OpenAI</span>
                  <ExternalLink className="w-3 h-3" style={{ color: "#d97757" }} />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full rounded-[8px] px-3 py-2 text-[14px] font-mono focus:ring-1 outline-hidden"
                style={{ backgroundColor: "#faf9f5", border: "1px solid #cccbc8", color: "#141413" }}
              />
            </div>
          )}

          {/* Modo Offline */}
          {provider === "offline" && (
            <div className="p-4 rounded-[12px] text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", border: "1px solid #cccbc8", color: "#141413", fontFamily: "var(--font-anthropic-serif)" }}>
              O modo offline utiliza o motor baseado nos 4 dicionários estruturados da Unicamp, sem necessidade de internet.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "rgba(227, 218, 204, 0.3)", borderTop: "1px solid #cccbc8" }}>
          <span className="text-[12px]" style={{ color: "#b0aea5" }}>
            {savedSuccess ? "Configurações salvas!" : "As alterações têm efeito imediato."}
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={onClose} variant="ghost" size="md">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : null}
            >
              {savedSuccess ? "Salvo!" : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
