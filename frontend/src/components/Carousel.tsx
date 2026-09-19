"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/entities/product.entity";
import { ChevronLeft, ChevronRight, Tag, CheckCircle2, AlertCircle, Sparkles, ArrowUpRight } from "lucide-react";

interface CarouselProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

export const Carousel: React.FC<CarouselProps> = ({ products, onSelectProduct }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const timeout = setTimeout(nextSlide, AUTOPLAY_MS);
    return () => clearTimeout(timeout);
  }, [isPaused, nextSlide, products.length, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl bg-ink-900 border border-white/5 flex flex-col items-center justify-center text-ink-400 p-8">
        <Sparkles className="w-12 h-12 mb-3 text-brand-400/60 animate-pulse" />
        <p className="text-base font-medium">Cargando catálogo de productos...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-ink-900 text-white shadow-2xl shadow-black/40 border border-white/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carrusel"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-ink-900 to-ink-950 pointer-events-none" />
      <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Slide */}
      <div
        key={currentProduct.id}
        className="relative min-h-[460px] grid grid-cols-1 lg:grid-cols-12 items-center p-6 pb-16 sm:p-10 sm:pb-16 lg:px-16 gap-8 animate-fade-up"
      >
        {/* Imagen (arriba en móvil, derecha en escritorio) */}
        <div className="lg:col-span-6 lg:order-2 flex items-center justify-center">
          <div className="w-full max-w-md aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-ink-950/70 backdrop-blur text-[11px] font-mono text-ink-200 ring-1 ring-white/10">
              {String(currentIndex + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Información */}
        <div className="lg:col-span-6 lg:order-1 flex flex-col justify-center space-y-4 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-400/15 text-brand-200 ring-1 ring-brand-300/25">
              <Tag className="w-3.5 h-3.5" />
              {currentProduct.category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${currentProduct.inStock ? "bg-white/5 text-ink-200 ring-white/10" : "bg-rose-500/15 text-rose-300 ring-rose-400/30"}`}>
              {currentProduct.inStock ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-brand-300" /> {currentProduct.stock} disponibles
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Agotado
                </>
              )}
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white line-clamp-2">
            {currentProduct.name}
          </h3>

          <p className="text-ink-300 text-sm sm:text-base leading-relaxed line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="pt-1 flex items-baseline gap-3">
            <span className="font-display text-3xl sm:text-4xl font-bold text-accent-300">
              {currentProduct.formattedPrice}
            </span>
            <span className="text-xs text-ink-400 uppercase tracking-wider">Precio sugerido</span>
          </div>

          {onSelectProduct && (
            <div className="pt-2">
              <button
                onClick={() => onSelectProduct(currentProduct)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-300 text-ink-950 font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Ver Detalle del Producto</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        aria-label="Producto anterior"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-ink-950/60 hover:bg-brand-400 hover:text-ink-950 text-white ring-1 ring-white/10 backdrop-blur-md transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente producto"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-ink-950/60 hover:bg-brand-400 hover:text-ink-950 text-white ring-1 ring-white/10 backdrop-blur-md transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores con barra de progreso del autoavance */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a producto ${idx + 1}`}
            aria-current={idx === currentIndex}
            className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
              idx === currentIndex ? "w-10 bg-white/20" : "w-2.5 bg-white/25 hover:bg-white/50"
            }`}
          >
            {idx === currentIndex && (
              <span
                key={`${currentIndex}-${isPaused}`}
                className={`absolute inset-0 origin-left bg-brand-300 ${isPaused ? "" : "animate-slide-progress"}`}
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
