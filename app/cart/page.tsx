'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';

type Item = { slug:string; qty:number };
type Prod = { slug:string; name:string; price:number; images:string[]; stock?: number };

const fetchProducts = async (): Promise<Prod[]> => {
  try { const r = await fetch('/api/public/products'); const j = await r.json(); return j.products || []; } catch { return []; }
};

function getCart(): Item[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}
function setCart(items: Item[]) { localStorage.setItem('cart', JSON.stringify(items)); window.dispatchEvent(new Event('storage')); }

export default function CartPage() {
  const [items, setItems] = useState<Item[]>(typeof window !== 'undefined' ? getCart() : []);
  const [products, setProducts] = useState<Prod[]>([]);
  const [billing, setBilling] = useState({ name: '', email: '', rfc: '' });
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<string>('');

  useEffect(()=> {
    fetchProducts().then(setProducts);
    const onChange = ()=> setItems(getCart());
    window.addEventListener('storage', onChange);
    return ()=> window.removeEventListener('storage', onChange);
  }, []);

  const map = useMemo(()=> Object.fromEntries(products.map(p=> [p.slug, p])), [products]);
  const lines = useMemo(()=> items.map(it=> ({ ...it, product: map[it.slug] })).filter(l=> l.product), [items, map]);

  const subtotal = useMemo(()=> lines.reduce((s,l)=> s + l.product.price * l.qty, 0), [lines]);
  const discount = useMemo(()=> {
    const code = (coupon||'').trim().toUpperCase();
    if (!code) return 0;
    if (code === 'DESC10') return subtotal*0.10;
    if (code === 'DESC15') return subtotal*0.15;
    return 0;
  }, [coupon, subtotal]);
  const shippingThreshold = 999;
  const shipping = useMemo(()=> {
    const code = (coupon||'').trim().toUpperCase();
    if (subtotal - discount >= shippingThreshold) return 0;
    if (code === 'ENVIOGRATIS') return 0;
    return subtotal>0 ? 99 : 0;
  }, [subtotal, discount, coupon]);
  const total = useMemo(()=> Math.max(0, subtotal - discount + shipping), [subtotal, discount, shipping]);
  const progress = Math.min(100, Math.round(((subtotal - discount) / shippingThreshold) * 100));

  function inc(slug: string) {
    const next = items.map(i=> i.slug===slug ? { ...i, qty: i.qty+1 } : i);
    setItems(next); setCart(next);
  }
  function dec(slug: string) {
    const next = items.map(i=> i.slug===slug ? { ...i, qty: Math.max(1, i.qty-1) } : i);
    setItems(next); setCart(next);
  }
  function remove(slug: string) {
    const next = items.filter(i=> i.slug!==slug);
    setItems(next); setCart(next);
  }
  function clear() {
    setItems([]); setCart([]);
  }

  async function payMP() {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout/mp', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ items, billing })
      });
      const j = await res.json();
      if (j?.init_point) {
        window.location.href = j.init_point;
      } else {
        toast('Error creando pago');
        setLoading(false);
      }
    } catch (e) {
      toast('Error creando pago');
      setLoading(false);
    }
  }

  const empty = lines.length === 0;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Tu carrito</h1>

      {empty ? (
        <div className="mt-6">Tu carrito está vacío. <a className="text-brand underline" href="/">Ir a la tienda</a></div>
      ) : (
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-4 rounded-xl border bg-white p-3">
              {subtotal - discount < shippingThreshold ? (
                <div className="text-sm">Agrega ${Math.max(0, shippingThreshold - (subtotal - discount)).toFixed(0)} MXN más para envío <b>gratis</b>.</div>
              ) : (
                <div className="text-sm text-emerald-700">¡Ya tienes <b>envío gratis</b>!</div>
              )}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full bg-brand" style={{ width: `${progress}%` }}/>
              </div>
            </div>

            <ul className="space-y-4">
              {lines.map((l)=> (
                <li key={l.slug} className="flex gap-4 rounded-2xl border bg-white p-3 sm:p-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image src={l.product.images?.[0] || '/logo.png'} alt={l.product.name} fill className="object-cover"/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 font-semibold">{l.product.name}</div>
                        <div className="text-sm text-neutral-600">${l.product.price} MXN</div>
                      </div>
                      <button className="btn" onClick={()=>remove(l.slug)}>Quitar</button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="btn" onClick={()=>dec(l.slug)}>-</button>
                      <input className="w-16 rounded-md border px-2 py-1 text-center" value={l.qty} onChange={e=>{
                        const v = Math.max(1, parseInt(e.target.value||'1')); 
                        const next = items.map(i=> i.slug===l.slug ? { ...i, qty: v } : i);
                        setItems(next); setCart(next);
                      }} />
                      <button className="btn" onClick={()=>inc(l.slug)}>+</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between">
              <button className="btn" onClick={clear}>Vaciar carrito</button>
              <a className="btn" href="/">Seguir comprando</a>
            </div>
          </div>

          <aside className="rounded-2xl border bg-white p-4">
            <div className="font-semibold">Resumen</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)} MXN</span></div>
              <div className="flex justify-between items-center">
                <span>Cupon</span>
                <div className="flex gap-2">
                  <input className="input h-9 w-40" placeholder="DESC10 / DESC15 / ENVIOGRATIS" value={coupon} onChange={e=>setCoupon(e.target.value)}/>
                  <button className="btn h-9" onClick={()=>coupon && toast('Cupón aplicado')}>Aplicar</button>
                </div>
              </div>
              {discount>0 && <div className="flex justify-between text-emerald-700"><span>Descuento</span><span>- ${discount.toFixed(2)} MXN</span></div>}
              <div className="flex justify-between"><span>Envío</span><span>{shipping===0? 'Gratis' : `$${shipping.toFixed(2)} MXN`}</span></div>
              <div className="border-t pt-2 font-semibold flex justify-between"><span>Total</span><span>${total.toFixed(2)} MXN</span></div>
            </div>

            <div className="mt-6">
              <div className="font-semibold mb-2">Datos de facturación (opcional)</div>
              <input className="input" placeholder="Nombre o Razón social" value={billing.name} onChange={e=>setBilling({...billing, name: e.target.value})} />
              <input className="input" placeholder="Email para factura" value={billing.email} onChange={e=>setBilling({...billing, email: e.target.value})} />
              <input className="input" placeholder="RFC" value={billing.rfc} onChange={e=>setBilling({...billing, rfc: e.target.value.toUpperCase()})} />
            </div>

            <button className="btn-primary mt-4 w-full disabled:opacity-60" disabled={loading} onClick={payMP}>
              {loading ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}
            </button>
            <div className="mt-3 text-xs text-neutral-500">* El pago se procesa de forma segura en Mercado Pago.</div>
          </aside>
        </div>
      )}
    </div>
  );
}
