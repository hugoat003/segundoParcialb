"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Package, Boxes, LogOut, Home, X } from "lucide-react";

interface SidebarProps {
  /** Solo aplica en pantallas pequeñas, donde el sidebar es un panel deslizable */
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    {
      name: "Productos",
      href: "/dashboard/products",
      icon: Boxes,
    },
  ];

  return (
    <>
      {/* Fondo oscuro en móvil cuando el panel está abierto */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-ink-950 text-ink-200 flex flex-col shrink-0 border-r border-white/5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Marca */}
        <div className="h-16 px-5 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-ink-950 shadow-lg shadow-brand-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base tracking-tight leading-none">UMG Dashboard</h2>
              <span className="text-xs text-ink-400">Examen Parcial</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar menú" className="lg:hidden p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Módulos del sistema</p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-400/10 text-brand-200 ring-1 ring-brand-400/20"
                    : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-400" />}
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>Ver catálogo público</span>
            </Link>
          </div>
        </nav>

        {/* Perfil de usuario */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2.5 mb-3 rounded-xl bg-white/[0.03] ring-1 ring-white/5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                isAdmin ? "bg-accent-400 text-accent-950" : "bg-brand-400 text-brand-950"
              }`}
            >
              {user?.username?.slice(0, 2).toUpperCase() || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || user?.username}</p>
              <p className="text-[11px] text-ink-400 truncate">@{user?.username}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 uppercase tracking-wide ${
                isAdmin ? "bg-accent-400/15 text-accent-300" : "bg-brand-400/15 text-brand-300"
              }`}
            >
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-ink-300 hover:text-white bg-white/5 hover:bg-rose-600 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
