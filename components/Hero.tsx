'use client';
import useSWR from 'swr';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function Hero() {
  const { data } = useSWR('/api/public/settings', fetcher);
  const heroImg = data?.heroImage || process.env.NEXT_PUBLIC_HERO_IMAGE_URL || 'https://upload.wikimedia.org/wikipedia/commons/5/59/MAAOA-Alebrijes-1.jpg';
  const title = data?.heroTitle || 'Artesanías que cuentan historias';
  const subtitle = data?.heroSubtitle || 'Souvenirs hechos en México, seleccionados con amor';
  const cta = data?.heroCTA || 'Comprar ahora';

  return (
    <section className="relative h-[85vh] min-h-[540px] w-full overflow-hidden rounded-3xl">
      <Image src={heroImg} alt="Hero" fill priority className="object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      <div className="absolute inset-0 flex items-center">
        <div className="container text-white">
          <div className="badge mb-4 bg-white/20 text-white backdrop-blur">Hecho en México</div>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold drop-shadow-md">{title}</h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg opacity-90">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="#colecciones" className="btn-primary">{cta}</Link>
            <a href="#story" className="btn">Conoce nuestra historia</a>
          </div>
          <ul className="mt-6 grid grid-cols-3 gap-3 text-sm text-white/90">
            <li className="flex items-center gap-2"><Truck className="h-5 w-5"/> Envío 24–72h</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Devoluciones 30 días</li>
            <li className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> Tarjetas, MSI, SPEI, OXXO</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
