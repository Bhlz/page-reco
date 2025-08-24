'use client';
import Link from 'next/link';
import { ShoppingCart, Gift } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Prod = { slug: string; price: number };
const fetchProducts = async (): Promise<Prod[]> => {
  try { const r = await fetch('/api/public/products'); const j = await r.json(); return j.products || []; } catch { return []; }
};

function getCart(): { slug: string; qty: number }[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}

export default function Header() {
  const [cart, setCart] = useState<{ slug:string; qty:number }[]>(typeof window !== 'undefined' ? getCart() : []);
  const [products, setProducts] = useState<Prod[]>([]);

  useEffect(()=> {
    fetchProducts().then(setProducts);
    const onChange = ()=> setCart(getCart());
    window.addEventListener('storage', onChange);
    const interval = setInterval(onChange, 500); // fallback para cambios locales
    return ()=> { window.removeEventListener('storage', onChange); clearInterval(interval); };
  }, []);

  const count = useMemo(()=> cart.reduce((s,i)=> s+i.qty,0), [cart]);
  const prices = useMemo(()=> Object.fromEntries(products.map(p=> [p.slug, p.price])), [products]);
  const subtotal = useMemo(()=> cart.reduce((s,i)=> s + (prices[i.slug]||0)*i.qty, 0), [cart, prices]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Gift className="h-6 w-6 text-accent" /> SouvenirsMX
        </Link>
        <nav className="hidden gap-6 md:flex">
          <a href="#colecciones" className="hover:text-brand">Colecciones</a>
          <a href="#opinion" className="hover:text-brand">Reseñas</a>
          <a href="#faq" className="hover:text-brand">FAQ</a>
        </nav>
        <Link href="/cart" className="btn btn-secondary">
          <ShoppingCart className="mr-2 h-5 w-5"/>
          {count>0 ? <>Carrito ({count} · ${subtotal.toFixed(0)})</> : 'Carrito'}
        </Link>
      </div>
    </header>
  );
}
