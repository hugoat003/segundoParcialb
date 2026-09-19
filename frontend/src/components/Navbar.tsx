"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, LogIn, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-ink-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-ink-950 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-lg text-white leading-tight">Portal UMG</span>
            <span className="hidden sm:block text-xs text-ink-400 truncate">Segundo Parcial · Catálogo</span>
          </div>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/products"
                title="Panel de productos"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-brand-200 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-400/20 rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Panel de Productos</span>
              </Link>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-ink-200">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-accent-300" />
                ) : (
                  <UserIcon className="w-4 h-4 text-brand-300" />
                )}
                <span>{user?.username}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isAdmin ? "bg-accent-400/15 text-accent-300" : "bg-brand-400/15 text-brand-300"}`}>
                  {isAdmin ? "ADMIN" : "USER"}
                </span>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="p-2 text-ink-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap shrink-0 text-sm font-semibold text-ink-950 bg-brand-400 hover:bg-brand-300 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
