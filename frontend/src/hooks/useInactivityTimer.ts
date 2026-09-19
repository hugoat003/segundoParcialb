"use client";

import { useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "click", "scroll", "wheel", "touchstart"] as const;
// Durante la advertencia solo una acción explícita mantiene la sesión (no un movimiento casual)
const EXPLICIT_EVENTS = new Set<string>(["keydown"]);
// Compartido entre pestañas: actividad en una pestaña mantiene viva la sesión en las demás
const LAST_ACTIVITY_KEY = "lastActivity";
const WRITE_THROTTLE_MS = 1_000;

interface Options {
  timeoutMs: number;
  warningMs: number;
  enabled: boolean;
  onTimeout: () => void;
}

/**
 * Detecta inactividad del usuario. Devuelve los segundos restantes cuando se entra en la
 * ventana de advertencia (o null si el usuario está activo) y una función para reiniciar.
 */
export function useInactivityTimer({ timeoutMs, warningMs, enabled, onTimeout }: Options) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const markActivity = () => {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {
      // almacenamiento no disponible: el temporizador sigue funcionando por pestaña
    }
  };

  useEffect(() => {
    if (!enabled) {
      setSecondsLeft(null);
      return;
    }

    let lastLocalActivity = Date.now();
    let lastWrite = 0;
    let firedTimeout = false;
    let warningVisible = false;
    markActivity();

    const handleActivity = (event: Event) => {
      if (warningVisible && !EXPLICIT_EVENTS.has(event.type)) return;
      lastLocalActivity = Date.now();
      if (lastLocalActivity - lastWrite > WRITE_THROTTLE_MS) {
        lastWrite = lastLocalActivity;
        markActivity();
      }
    };

    const getLastActivity = () => {
      const shared = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
      return Math.max(shared, lastLocalActivity);
    };

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - getLastActivity();
      const remainingMs = timeoutMs - idleMs;

      if (remainingMs <= 0) {
        if (!firedTimeout) {
          firedTimeout = true;
          console.warn(`[INACTIVIDAD] ${Math.round(timeoutMs / 1000)}s sin actividad, cerrando sesión`);
          onTimeoutRef.current();
        }
        return;
      }

      warningVisible = remainingMs <= warningMs;
      setSecondsLeft(warningVisible ? Math.ceil(remainingMs / 1000) : null);
    }, 1_000);

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [enabled, timeoutMs, warningMs]);

  return { secondsLeft, resetActivity: markActivity };
}
