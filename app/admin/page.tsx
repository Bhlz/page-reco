'use client';
import Link from 'next/link';
import { BarChart2, Package, Settings, CreditCard, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Panel administrativo</h1>
      <p className="mt-2 text-neutral-600">Gestiona tu tienda desde aquí.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/orders" className="card group">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-brand" />
            <div>
              <div className="font-semibold">Órdenes</div>
              <div className="text-sm text-neutral-600">Ver y actualizar pedidos</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/finance" className="card group">
          <div className="flex items-center gap-3">
            <BarChart2 className="h-6 w-6 text-brand" />
            <div>
              <div className="font-semibold">Finanzas</div>
              <div className="text-sm text-neutral-600">Ingresos, egresos y comisiones</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" className="card group">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-brand" />
            <div>
              <div className="font-semibold">Productos</div>
              <div className="text-sm text-neutral-600">Alta, edición y stock</div>
            </div>
          </div>
        </Link>

        <Link href="/admin/settings" className="card group">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-brand" />
            <div>
              <div className="font-semibold">Configuración</div>
              <div className="text-sm text-neutral-600">Textos legales y portada</div>
            </div>
          </div>
        </Link>

        <a href="/" className="card group">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-brand" />
            <div>
              <div className="font-semibold">Ver tienda</div>
              <div className="text-sm text-neutral-600">Abrir el sitio público</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
