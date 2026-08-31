import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-anthropic-serif",
  display: "swap"
});

const interSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-anthropic-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Linguagem Simples & Inclusiva | Metodologia Unicamp",
  description: "Ferramenta pública de avaliação, análise e adequação de textos de acordo com os princípios de Linguagem Simples e Inclusiva da Unicamp. Encontre, compreenda e use a informação.",
  keywords: ["Linguagem Simples", "Unicamp", "Redação Oficial", "Comunicação Pública", "Acessibilidade", "Linguagem Inclusiva"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sourceSerif.variable} ${interSans.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
