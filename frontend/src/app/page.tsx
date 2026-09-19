"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Carousel } from "@/components/Carousel";
import { ViewProductModal } from "@/components/ProductModals";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAll();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("No se pudo conectar a la API del backend, usando datos por defecto:", err);
        // Fallback dummy products for initial display before backend startup
        setProducts([
          {
            id: 1,
            name: "Laptop Pro 16 Ultra",
            description: "Portátil de alto rendimiento con procesador de última generación, 32GB RAM y 1TB SSD NVMe.",
            price: 1499.99,
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
            category: "Computación",
            formattedPrice: "Q1,499.99",
            inStock: true,
          },
          {
            id: 2,
            name: "Monitor Curvo UltraWide 34",
            description: "Pantalla curva IPS con resolución WQHD, tasa de refresco de 144Hz y soporte HDR400.",
            price: 649.50,
            stock: 25,
            imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
            category: "Monitores",
            formattedPrice: "Q649.50",
            inStock: true,
          },
          {
            id: 3,
            name: "Auriculares Inalámbricos Studio ANC",
            description: "Cancelación activa de ruido híbrida, audio de alta resolución y 40 horas de batería continua.",
            price: 289.00,
            stock: 40,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            category: "Audio",
            formattedPrice: "Q289.00",
            inStock: true,
          },
        ]);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const categories = new Set(products.map((p) => p.category)).size;
  const stats = [
    { label: "Productos en catálogo", value: products.length },
    { label: "Categorías", value: categories },
    { label: "Unidades disponibles", value: products.reduce((sum, p) => sum + p.stock, 0).toLocaleString("es-GT") },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Seguridad JWT con roles",
      body: (
        <>
          Control de acceso con <span className="text-accent-300 font-mono">ROLE_ADMIN</span> y{" "}
          <span className="text-brand-300 font-mono">ROLE_USER</span>, refresh tokens rotativos y cierre por inactividad.
        </>
      ),
    },
    {
      icon: Database,
      title: "PostgreSQL y Liquibase",
      body: "Evolución de esquema con changelogs versionados, garantizando tablas y datos semilla consistentes.",
    },
    {
      icon: Layers,
      title: "Arquitectura limpia + BFF",
      body: "Capas desacopladas (DTOs, Mappers, Services) y un proxy en Next.js que oculta el backend al navegador.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-ink-100">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)] pointer-events-none" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-400/10 ring-1 ring-brand-300/20 text-brand-200 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universidad Mariano Gálvez · Segundo Parcial</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Gestión y catálogo de <span className="text-gradient-brand">productos</span>
            </h1>

            <p className="text-ink-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Plataforma monorepo con Spring Boot (Java 21), PostgreSQL y Liquibase, autenticación JWT con roles y un frontend en Next.js.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={isAuthenticated ? "/dashboard/products" : "/login"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-400 hover:bg-brand-300 text-ink-950 font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>{isAuthenticated ? "Acceder al Panel Privado" : "Iniciar Sesión"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#destacados"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-ink-100 font-semibold text-sm transition-colors"
              >
                Ver catálogo
              </a>
            </div>

            {/* Métricas del catálogo */}
            <dl className="pt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/[0.03] ring-1 ring-white/5 px-3 py-4">
                  <dt className="text-[11px] sm:text-xs text-ink-400">{stat.label}</dt>
                  <dd className="font-display text-xl sm:text-3xl font-bold text-white mt-1 tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
          {/* Carrusel */}
          <section id="destacados" className="space-y-5 scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-400" />
                  <span>Productos destacados</span>
                </h2>
                <p className="text-sm text-ink-400 mt-1">Explora el catálogo dinámico de productos activos</p>
              </div>
              <span className="text-xs text-ink-500 hidden sm:inline">Se pausa al pasar el cursor · desliza en móvil</span>
            </div>

            <Carousel products={products} onSelectProduct={handleSelectProduct} />
          </section>

          {/* Características */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-ink-900/60 ring-1 ring-white/5 hover:ring-brand-400/30 hover:bg-ink-900 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-400/10 text-brand-300 flex items-center justify-center group-hover:bg-brand-400 group-hover:text-ink-950 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-ink-500">
        <p>Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería en Sistemas</p>
        <p className="mt-1">Examen Segundo Parcial · Spring Boot 3 + Next.js</p>
      </footer>

      {/* View Product Modal */}
      <ViewProductModal
        product={selectedProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
}
