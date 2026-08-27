import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-gt-pressura-standard",
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
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
