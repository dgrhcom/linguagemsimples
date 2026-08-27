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
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper rounded-card border border-slate max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Topo */}
        <div className="px-6 py-4 bg-ink flex items-center justify-between border-b border-slate">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-amber" />
            <h3 className="text-body font-display text-paper">Configurações de IA</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-stone hover:text-paper p-1"
            leftIcon={<X className="w-5 h-5" />}
          />
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5 text-body-sm text-charcoal">
          <div className="bg-sand/50 border border-sand rounded-tile p-4 space-y-2">
            <p className="text-body-sm leading-relaxed text-charcoal">
              A ferramenta funciona <strong>100% offline</strong> utilizando o motor determinístico da Unicamp. Para reescritas contextuais, configure uma chave de API gratuita do <strong>Google Gemini</strong> ou da <strong>OpenAI</strong>.
            </p>
          </div>

          {/* Seleção de Modo */}
          <div className="space-y-2">
            <label className="font-display text-body-sm text-ink block">Motor de IA:</label>
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
                  className={`p-3 rounded-tile text-left border transition-colors ${
                    provider === opt.id
                      ? "bg-ink text-paper border-slate"
                      : "bg-paper text-charcoal border-sand hover:border-deep-stone"
                  }`}
                >
                  <div className="text-body-sm font-display">{opt.label}</div>
                  <div className="text-micro-label text-stone mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Chave Gemini */}
          {provider === "gemini" && (
            <div className="space-y-2 bg-sand/30 p-4 rounded-tile border border-sand">
              <div className="flex justify-between items-center">
                <label className="font-display text-body-sm text-ink">Chave de API do Google Gemini:</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-caption text-charcoal flex items-center gap-1"
                >
                  <span>Obter chave</span>
                  <ExternalLink className="w-3 h-3 text-amber" />
                </a>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-paper-light border border-sand rounded-input px-3 py-2 text-body-sm font-mono focus:border-deep-stone focus:ring-1 focus:ring-deep-stone outline-hidden"
              />
              <span className="text-micro-label text-stone block">
                Sua chave fica salva apenas no navegador (localStorage).
              </span>
            </div>
          )}

          {/* Campo de Chave OpenAI */}
          {provider === "openai" && (
            <div className="space-y-2 bg-sand/30 p-4 rounded-tile border border-sand">
              <div className="flex justify-between items-center">
                <label className="font-display text-body-sm text-ink">Chave de API da OpenAI:</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ghost-link text-caption text-charcoal flex items-center gap-1"
                >
                  <span>Obter na OpenAI</span>
                  <ExternalLink className="w-3 h-3 text-amber" />
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-paper-light border border-sand rounded-input px-3 py-2 text-body-sm font-mono focus:border-deep-stone focus:ring-1 focus:ring-deep-stone outline-hidden"
              />
            </div>
          )}

          {/* Modo Offline */}
          {provider === "offline" && (
            <div className="bg-sand/30 p-4 rounded-tile border border-sand text-charcoal text-body-sm leading-relaxed">
              O modo offline utiliza o motor baseado nos 4 dicionários estruturados da Unicamp, sem necessidade de internet.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="bg-sand/30 px-6 py-4 border-t border-sand flex items-center justify-between">
          <span className="text-caption text-stone">
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
