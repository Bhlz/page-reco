'use client';
import Image from 'next/image';
import Link from 'next/link';
import { addToCart } from '@/lib/cart';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import type { Product } from '@/lib/types';

export default function ProductCard({ p }: { p: Product }) {
  const [adding, setAdding] = useState(false);

  async function quickAdd() {
    setAdding(true);
    addToCart(p.slug, 1);
    window.dispatchEvent(new Event('storage'));
    toast('Agregado al carrito');
    setTimeout(()=> setAdding(false), 300);
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-white transition hover:shadow-xl">
      <Link href={`/product/${p.slug}`} className="block">
        <div className="relative aspect-[4/5] w-full">
          <Image src={p.images?.[0] || '/logo.png'} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute left-0 top-0 m-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow"> ${p.price} MXN</div>
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${p.slug}`} className="line-clamp-1 font-semibold hover:underline">{p.name}</Link>
            <div className="mt-1 text-xs text-neutral-500">{p.rating} ★ · {p.reviews} reseñas</div>
          </div>
          <button
            onClick={quickAdd}
            className="btn whitespace-nowrap"
            disabled={adding}
            aria-label="Agregar rápido"
            title="Agregar rápido"
          >
            {adding ? 'Agregando…' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
