import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
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
    <html lang="pt-BR" className={montserrat.variable}>
      <body className="antialiased flex flex-col min-h-screen font-sans bg-[#f6f9fc] text-[#1c2d42]">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
