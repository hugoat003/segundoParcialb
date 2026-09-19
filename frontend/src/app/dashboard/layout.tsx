"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { InactivityWarning } from "@/components/InactivityWarning";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { Loader2 } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
const INACTIVITY_WARNING_MS = 30 * 1000;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
