"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/entities/product.entity";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "@/components/DataTable";
import {
  ViewProductModal,
  ProductFormModal,
  DeleteConfirmModal,
} from "@/components/ProductModals";
import {
  Boxes,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Wallet,
} from "lucide-react";

export default function ProductsPage() {
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formProduct, setFormProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err: any) {
      showToast(err.message || "Error al cargar la lista de productos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // View Handler
  const handleView = (product: Product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  // Create Handler
  const handleCreate = () => {
    setFormProduct(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Edit Handler
  const handleEdit = (product: Product) => {
    setFormProduct(product);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  // Delete Handler
  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Submit Form (Create / Edit)
  const handleFormSubmit = async (data: Partial<Product>) => {
    if (formMode === "create") {
      await ProductService.create(data);
      showToast("¡Producto creado exitosamente!");
    } else if (formMode === "edit" && formProduct) {
      await ProductService.update(formProduct.id, data);
      showToast("¡Producto actualizado exitosamente!");
    }
    await loadProducts();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    await ProductService.delete(deleteProduct.id);
    showToast(`El producto "${deleteProduct.name}" ha sido eliminado.`);
    await loadProducts();
  };

  const metrics = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const outOfStock = products.filter((p) => !p.inStock).length;
    return [
      {
        label: "Productos",
        value: products.length.toString(),
        hint: `${new Set(products.map((p) => p.category)).size} categorías`,
        icon: Boxes,
        tone: "bg-brand-100 text-brand-700",
      },
      {
        label: "Unidades en stock",
        value: totalUnits.toLocaleString("es-GT"),
        hint: "Suma de inventario",
        icon: PackageCheck,
        tone: "bg-ink-100 text-ink-700",
      },
      {
        label: "Valor del inventario",
        value: new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", notation: "compact" }).format(inventoryValue),
        hint: "Precio × stock",
        icon: Wallet,
        tone: "bg-accent-100 text-accent-700",
      },
      {
        label: "Agotados",
        value: outOfStock.toString(),
        hint: outOfStock > 0 ? "Requieren reabastecimiento" : "Todo con existencias",
        icon: PackageX,
        tone: outOfStock > 0 ? "bg-rose-100 text-rose-700" : "bg-brand-100 text-brand-700",
      },
    ];
  }, [products]);

  return (
    <div className="p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
      {/* Toast alert */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl ring-1 text-sm font-medium animate-fade-up ${
            toast.type === "success"
              ? "bg-ink-900 ring-brand-400/30 text-white"
              : "bg-rose-50 ring-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-brand-300 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Módulo de inventario</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight">
            Hola, {user?.fullName?.split(" ")[0] || user?.username}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Consulta, busca y gestiona el inventario de productos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white ring-1 ring-ink-200 text-xs font-semibold text-ink-700">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-accent-600" />
            ) : (
              <UserIcon className="w-4 h-4 text-brand-600" />
            )}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isAdmin ? "bg-accent-100 text-accent-800" : "bg-brand-100 text-brand-800"
              }`}
            >
              {isAdmin ? "ADMINISTRADOR" : "USUARIO"}
            </span>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            title="Recargar listado"
            className="p-2.5 rounded-xl ring-1 ring-ink-200 bg-white hover:bg-ink-50 text-ink-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="p-4 sm:p-5 rounded-2xl bg-white ring-1 ring-ink-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-ink-500">{label}</p>
              <span className={`p-2 rounded-xl ${tone}`}>
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold text-ink-950 mt-1 tabular-nums">
              {loading && products.length === 0 ? "—" : value}
            </p>
            <p className="text-[11px] text-ink-400 mt-1 truncate">{hint}</p>
          </div>
        ))}
      </div>

      {/* Main DataTable */}
      <DataTable
        products={products}
        isAdmin={isAdmin}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* View Modal */}
      <ViewProductModal
        product={viewProduct}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={formProduct}
        mode={formMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={deleteProduct?.name || ""}
      />
    </div>
  );
}
