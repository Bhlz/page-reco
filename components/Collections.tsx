
'use client';
import useSWR from 'swr';
import ProductCard from '@/components/ProductCard';
import { useMemo, useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function Collections() {
  const { data } = useSWR('/api/public/products', fetcher);
  const products = data?.products || [];

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'price-asc'|'price-desc'>('popular');

  const filtered = useMemo(() => {
    let list = products;
    if (query) list = list.filter((p:any)=> p.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'price-asc') list = [...list].sort((a:any,b:any)=> a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a:any,b:any)=> b.price - a.price);
    return list;
  }, [products, query, sort]);

  return (
    <section id="colecciones" className="mt-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="section-title">Productos destacados</h2>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <input className="input w-full sm:w-64" placeholder="Buscar…" value={query} onChange={e=>setQuery(e.target.value)} />
          <select className="input sm:w-48" value={sort} onChange={e=>setSort(e.target.value as any)}>
            <option value="popular">Más populares</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p:any)=> <ProductCard key={p.slug} p={p} />)}
      </div>
    </section>
  );
}
