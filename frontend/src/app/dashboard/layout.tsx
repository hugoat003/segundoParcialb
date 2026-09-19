"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { InactivityWarning } from "@/components/InactivityWarning";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { Loader2, Menu, Package } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
const INACTIVITY_WARNING_MS = 30 * 1000;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cierre automático tras 3 minutos sin actividad (aviso durante los últimos 30 segundos)
  const { secondsLeft, resetActivity } = useInactivityTimer({
    timeoutMs: INACTIVITY_TIMEOUT_MS,
    warningMs: INACTIVITY_WARNING_MS,
    enabled: isAuthenticated,
    onTimeout: () => logout("INACTIVITY"),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center text-ink-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-ink-50 text-ink-900">
      {/* Sidebar (fijo en escritorio, panel deslizable en móvil) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior móvil */}
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center gap-3 bg-ink-950 text-white border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className="p-2 -ml-2 rounded-lg hover:bg-white/5">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-ink-950">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-sm">UMG Dashboard</span>
        </header>

        {children}
      </div>

      {secondsLeft !== null && (
        <InactivityWarning
          secondsLeft={secondsLeft}
          onStayConnected={resetActivity}
          onLogout={() => logout()}
        />
      )}
    </div>
  );
}
