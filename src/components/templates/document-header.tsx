import React from "react";
import { UniversalDocumentMetadata } from "@/types/document";

export function UnicampLogoVector({
  width = 36,
  height = 40,
  className = ""
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 239.86 269.2"
      className={className}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        maxWidth: typeof width === "number" ? `${width}px` : width,
        maxHeight: typeof height === "number" ? `${height}px` : height,
        display: "block",
        flexShrink: 0
      }}
      aria-label="Logo Unicamp"
    >
      <defs>
        <style>{`.unicamp-red{fill:#ed1c24;fill-rule:evenodd;}.unicamp-black{fill:#141413;fill-rule:evenodd;}.unicamp-circle{fill:#ed1c24;}`}</style>
      </defs>
      {/* Red Geometric Petals and Shield */}
      <path className="unicamp-red" d="M110.13,88.87V3c9.94,.23,19.83,1.64,29.47,4.28-.99,5.89,1.53,11.77,6.42,15.17l-28.43,67.99c-2.45-.8-4.93-1.3-7.45-1.57Z" />
      <path className="unicamp-red" d="M102.63,88.87V3.12c-13.53,.69-26.75,4.01-39.02,9.78l31.8,77.47c2.33-.76,4.74-1.26,7.22-1.49Z" />
      <path className="unicamp-red" d="M89.66,92.52L58.02,15.48c-12.15,6.23-23.12,14.64-32.29,24.76l56.94,56.94c2.14-1.8,4.47-3.36,6.99-4.66Z" />
      <path className="unicamp-red" d="M21.78,44.9c-8.37,9.94-14.71,21.44-18.65,33.78l70.78,29.62c1.22-2.41,2.75-4.7,4.51-6.76L21.78,44.9Z" />
      <path className="unicamp-red" d="M71.42,114L1.64,84.8c-1.61,12.46-1.3,25.07,.92,37.41H69.78c.23-2.79,.8-5.54,1.64-8.22Z" />
      <path className="unicamp-red" d="M69.8,128.39H4.3c3.97,10.32,9.13,20.1,15.33,29.24l51.75-21.25c-.8-2.6-1.34-5.27-1.57-7.99Z" />
      <path className="unicamp-red" d="M78.52,148.65c-1.83-2.14-3.4-4.47-4.66-6.99l-49.95,20.48c6.96,6.92,14.64,12.99,22.89,18.23l31.72-31.72Z" />
      <path className="unicamp-red" d="M118.23,194.44c-.73-5.92,1.99-11.69,7.03-14.9l-7.91-19.57c-11.96,3.71-24.99,1.07-34.55-7.03l-30.57,30.57c20.22,10.74,43.41,14.6,66,10.93Z" />
      <path className="unicamp-red" d="M122.69,157.77l7.95,19.72c6.15-1.03,12.27,1.76,15.55,7.03,3.4-1.61,6.76-3.29,10.09-5.04l-26.41-26.45c-2.22,1.87-4.62,3.48-7.18,4.74Z" />
      <path className="unicamp-red" d="M217.72,136.09c-2.22-2.18-3.75-4.97-4.36-8.06h-70.66c-.61,7.61-3.63,14.83-8.52,20.64l27.71,27.71c20.14-11.16,38.87-24.69,55.84-40.28Z" />
      <path className="unicamp-red" d="M177.8,29.51c3.32,3.32,6.42,6.84,9.33,10.55l-57.33,57.33c-2.1-1.76-4.36-3.25-6.76-4.51l28.43-67.99c5.27,1.07,10.74-.76,14.37-4.78,4.2,2.83,8.22,6,11.96,9.4Z" />
      <path className="unicamp-red" d="M208.6,79.96c-3.44-8.14-7.22-16.13-11.35-23.96-2.1-3.71-4.32-7.34-6.65-10.89l-56.52,56.52c1.8,2.18,3.36,4.51,4.62,6.99l69.9-28.66Z" />
      <path className="unicamp-red" d="M211.03,85.63c3.4,8.83,6.5,17.81,9.17,26.91-3.44,2.18-5.89,5.69-6.76,9.71h-70.7c-.23-2.71-.73-5.39-1.57-7.99l69.86-28.62Z" />
      
      {/* 3 Circular Satellites */}
      <circle className="unicamp-circle" cx="133.11" cy="192.69" r="9.25" />
      <circle className="unicamp-circle" cx="230.21" cy="123.8" r="9.25" />
      <circle className="unicamp-circle" cx="154.43" cy="9.92" r="9.25" />
      
      {/* "UNICAMP" Wordmark Lettering */}
      <g className="unicamp-black">
        {/* U */}
        <path d="M9.42,259.29v-15.29H2.62v18.61c0,3.25,2.64,5.85,5.85,5.85H27.53c3.25,0,5.85-2.6,5.85-5.85v-18.42h-6.8v15.1c0,1.68-1.38,3.06-3.06,3.06H12.48c-1.68,0-3.06-1.38-3.06-3.06Z" />
        {/* N */}
        <polygon points="39.21 268.61 39.21 244.34 49.6 244.34 63.74 261.08 63.74 244.49 71 244.49 71 268.61 59.92 268.61 46.31 252.71 46.31 268.61 39.21 268.61" />
        {/* I */}
        <rect x="77.1" y="244.15" width="6.8" height="24.46" />
        {/* C */}
        <path d="M111.14,259.69h6.76v3.25c0,3.36-2.9,6-6.27,5.66h-14.06c-3.52,0-6.42-2.64-6.8-6.11v-12.23c0-3.63,3.17-6.5,6.8-6.11h14.06c3.25,0,5.96,2.45,6.31,5.66v3.29h-6.8c-.04-1.64-1.41-2.9-3.06-2.83h-7.11c-1.8-.08-3.32,1.3-3.4,3.06v6.11c.08,1.8,1.6,3.13,3.4,3.06h7.11c1.6,.08,2.98-1.15,3.06-2.79Z" />
        {/* A */}
        <path d="M131.6,264.76l-1.67,3.89h-7.23l10.01-24.2h11.13l10.29,24.2h-7.79l-1.11-3.89h-13.63Zm10.85-5.84l-4.17-10.29-4.17,10.29h8.34Z" />
        {/* M */}
        <polygon points="166.66 254.63 166.66 268.5 159.86 268.5 159.86 244.04 167.69 244.04 179.96 263.11 191.39 244.04 199.1 244.04 199.1 268.5 192.3 268.5 192.3 255.39 184.43 268.5 175.56 268.5 166.66 254.63" />
        {/* P */}
        <path d="M205.36,268.61v-24.76h21.42c3.34,0,5.84,2.78,6.4,6.12v6.68c0,3.34-3.06,6.4-6.4,6.4h-14.19v5.56h-7.23Zm7.23-12.24h10.85c4.17,0,4.17-6.12,0-6.12h-10.85v6.12Z" />
      </g>
    </svg>
  );
}

import { UNICAMP_LOGO_JPG_DATA_URL } from "@/data/unicamp-logo-base64";

interface DocumentHeaderProps {
  metadata: UniversalDocumentMetadata;
}

/**
 * Cabeçalho Oficial Unicamp Unificado para todos os 20 modelos de documentos.
 * Utiliza o logotipo oficial em JPG de alta fidelidade e inline-styles resilientes.
 */
export function DocumentHeader({ metadata }: DocumentHeaderProps) {
  return (
    <header
      className="border-b border-zinc-950 pb-3"
      style={{
        borderBottom: "1px solid #000000",
        paddingBottom: "12px",
        marginBottom: "16px",
        width: "100%",
        display: "block"
      }}
    >
      <div
        className="flex justify-between items-center gap-3"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "12px"
        }}
      >
        {/* Logotipos Institucionais à Esquerda */}
        <div
          className="flex items-center gap-2 shrink-0"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0
          }}
        >
          {!metadata.hideUnicampLogo && (
            <div
              className="shrink-0 flex items-center"
              style={{
                width: "36px",
                height: "40px",
                maxWidth: "36px",
                maxHeight: "40px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
            >
              <img
                src={UNICAMP_LOGO_JPG_DATA_URL || "/images/logo-unicamp.jpg"}
                alt="Logo Unicamp"
                width="36"
                height="40"
                style={{
                  width: "36px",
                  height: "40px",
                  maxWidth: "36px",
                  maxHeight: "40px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </div>
          )}

          {metadata.customUnitLogo && (
            <div
              className="shrink-0 border-l border-zinc-300 pl-2.5 flex items-center"
              style={{
                height: "40px",
                maxHeight: "40px",
                width: "auto",
                flexShrink: 0,
                borderLeft: "1px solid #d4d4d8",
                paddingLeft: "10px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <img
                src={metadata.customUnitLogo}
                alt="Logo da Unidade"
                style={{
                  height: "40px",
                  maxHeight: "40px",
                  width: "auto",
                  objectFit: "contain",
                  objectPosition: "left center",
                  display: "block"
                }}
              />
            </div>
          )}
        </div>

        {/* Informações da Unidade e Contato à Direita */}
        <div
          className="text-right space-y-0.5"
          style={{
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
          }}
        >
          <h1
            className="text-[9px] font-bold text-zinc-900 tracking-tight leading-tight"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#18181b",
              margin: 0,
              fontFamily: "Arial, Helvetica, sans-serif"
            }}
          >
            {metadata.unitName || "Diretoria Geral de Recursos Humanos"}
          </h1>
          <p
            className="text-[7.5px] text-zinc-600 font-medium leading-tight"
            style={{
              fontSize: "7.5px",
              fontWeight: 500,
              lineHeight: 1.25,
              color: "#52525b",
              margin: 0,
              fontFamily: "Arial, Helvetica, sans-serif"
            }}
          >
            {metadata.emailSite || "dgrh@unicamp.br | www.dgrh.unicamp.br"}
          </p>
          <p
            className="text-[7.5px] text-zinc-500 font-medium leading-tight"
            style={{
              fontSize: "7.5px",
              fontWeight: 500,
              lineHeight: 1.25,
              color: "#71717a",
              margin: 0,
              fontFamily: "Arial, Helvetica, sans-serif"
            }}
          >
            Universidade Estadual de Campinas
          </p>
        </div>
      </div>
    </header>
  );
}
