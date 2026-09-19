"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/entities/product.entity";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  PackageOpen,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";

interface DataTableProps {
  products: Product[];
  isAdmin: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  products,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const query = searchTerm.toLowerCase();

    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(query);
      const matchDesc = p.description?.toLowerCase().includes(query);
      const matchCategory = p.category?.toLowerCase().includes(query);
      const matchPrice = p.price?.toString().includes(query) || p.formattedPrice?.toLowerCase().includes(query);
      const matchStock = p.stock?.toString().includes(query);

      return matchName || matchDesc || matchCategory || matchPrice || matchStock;
    });
  }, [products, searchTerm]);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

  const renderStockBadge = (product: Product) =>
    product.inStock ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 ring-1 ring-brand-200">
        <CheckCircle2 className="w-3 h-3 text-brand-600" />
        {product.stock} unidades
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-500" />
        Agotado
      </span>
    );

  const renderActions = (product: Product) => (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => onView(product)}
        title="Ver producto en grande"
        aria-label={`Ver ${product.name}`}
        className="p-2 text-ink-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
      >
        <Eye className="w-4 h-4" />
      </button>
      {isAdmin && (
        <button
          onClick={() => onEdit(product)}
          title="Editar producto"
          aria-label={`Editar ${product.name}`}
          className="p-2 text-ink-500 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {isAdmin && (
        <button
          onClick={() => onDelete(product)}
          title="Eliminar producto"
          aria-label={`Eliminar ${product.name}`}
          className="p-2 text-ink-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const renderThumbnail = (product: Product, size: string) => (
    <div className={`${size} rounded-xl overflow-hidden bg-ink-100 ring-1 ring-ink-200 shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
      />
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-ink-200/70 overflow-hidden">
      {/* Barra de herramientas */}
      <div className="p-4 sm:p-5 border-b border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, categoría, precio, stock..."
            className="w-full pl-10 pr-16 py-2.5 rounded-xl ring-1 ring-ink-200 bg-ink-50 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-400 hover:text-ink-700"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-ink-500 font-medium">
            <span className="text-ink-900 font-semibold">{filteredProducts.length}</span> de {products.length} productos
          </span>

          {isAdmin ? (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo producto</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-50 ring-1 ring-accent-200 text-accent-800 text-xs font-medium">
              <span>Modo lectura</span>
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <>
          {/* Vista de tarjetas (móvil) */}
          <ul className="md:hidden divide-y divide-ink-100">
            {filteredProducts.map((product) => (
              <li key={product.id} className="p-4 flex gap-3 group">
                {renderThumbnail(product, "w-16 h-16")}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-ink-900 text-sm line-clamp-2">{product.name}</p>
                    <p className="font-display font-bold text-ink-950 text-sm whitespace-nowrap">{product.formattedPrice}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-ink-100 text-ink-700">
                      <Tag className="w-3 h-3 text-ink-400" />
                      {product.category}
                    </span>
                    {renderStockBadge(product)}
                  </div>
                  <div className="-ml-2">
                    {renderActions(product)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Vista de tabla (tablet y escritorio) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-600">
              <thead className="bg-ink-50 text-ink-500 text-[11px] uppercase font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Producto</th>
                  <th scope="col" className="px-6 py-3.5">Categoría</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Precio</th>
                  <th scope="col" className="px-6 py-3.5">Inventario</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {renderThumbnail(product, "w-12 h-12")}
                        <div className="max-w-xs lg:max-w-sm">
                          <p className="font-semibold text-ink-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-ink-100 text-ink-700">
                        <Tag className="w-3 h-3 text-ink-400" />
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-display font-bold text-ink-950 tabular-nums">
                      {product.formattedPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStockBadge(product)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderActions(product)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-6 py-14 text-center text-ink-400">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-ink-100 flex items-center justify-center">
            <PackageOpen className="w-7 h-7 text-ink-400" />
          </div>
          <p className="font-semibold text-ink-800">No se encontraron productos</p>
          <p className="text-xs text-ink-500 mt-1">
            {searchTerm ? `No hay coincidencias para "${searchTerm}"` : "Aún no hay productos registrados en el sistema."}
          </p>
        </div>
      )}
    </div>
  );
};
