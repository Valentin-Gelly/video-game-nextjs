import type { Metadata } from "next";
import "./globals.css";
import { GlobalProvider } from "@/context/globalContext";
import Header from "@/app/component/Header";
import ClientOnly from "./component/ClientOnly";

export const metadata: Metadata = {
  title: "Si t'as de l'or",
  description: "Jeu de société en ligne inspiré de Citadelles ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <GlobalProvider>
        <body
          className={`--font-geist-sans --font-geist-mono antialiased bg-[#F5F3F0]`}
        >
          <Header></Header>
          <main className="bg-[#C2B280] text-[#0F172A]  w-full">
            {children}
          </main>
        </body>
      </GlobalProvider>
    </html>
  );
}
