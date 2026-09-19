"use client";

import React from "react";
import { Clock, LogOut } from "lucide-react";

interface InactivityWarningProps {
  secondsLeft: number;
  onStayConnected: () => void;
  onLogout: () => void;
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({ secondsLeft, onStayConnected, onLogout }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm" role="alertdialog" aria-live="assertive">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink-900">¿Sigues ahí?</h2>
          <p className="text-sm text-ink-500">
            Por seguridad, tu sesión se cerrará por inactividad en
          </p>
        </div>
        <p className="text-4xl font-extrabold tabular-nums text-amber-600">{secondsLeft}s</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={onStayConnected}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
};
