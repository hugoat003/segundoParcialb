import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Examen Parcial - Sistema de Productos UMG",
  description: "Plataforma de catálogo y gestión de productos con Next.js y Spring Boot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-ink-50 text-ink-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
