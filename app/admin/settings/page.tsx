'use client';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function AdminSettings() {
  const { data } = useSWR('/api/admin/settings', fetcher);
  const [form, setForm] = useState<any>({ help:'', shipping:'', privacy:'', billing:'', heroImage:'', heroTitle:'', heroSubtitle:'', heroCTA:'' });

  useEffect(()=> { if (data) setForm((p:any)=> ({ ...p, ...data })); }, [data]);

  async function save() {
    await fetch('/api/admin/settings', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(form) });
    alert('Guardado');
  }

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <div className="mt-6 grid gap-4">
        <div className="card space-y-2">
          <div className="font-semibold">Ayuda</div>
          <textarea className="input h-32" value={form.help||''} onChange={e=>setForm({...form, help: e.target.value})} />
        </div>
        <div className="card space-y-2">
          <div className="font-semibold">Envíos y devoluciones</div>
          <textarea className="input h-32" value={form.shipping||''} onChange={e=>setForm({...form, shipping: e.target.value})} />
        </div>
        <div className="card space-y-2">
          <div className="font-semibold">Política de privacidad</div>
          <textarea className="input h-32" value={form.privacy||''} onChange={e=>setForm({...form, privacy: e.target.value})} />
        </div>
        <div className="card space-y-2">
          <div className="font-semibold">Facturación</div>
          <textarea className="input h-32" value={form.billing||''} onChange={e=>setForm({...form, billing: e.target.value})} />
        </div>
        <div className="card space-y-2">
          <div className="font-semibold">Portada (Hero)</div>
          <input className="input" placeholder="URL imagen" value={form.heroImage||''} onChange={e=>setForm({...form, heroImage:e.target.value})}/>
          <input className="input" placeholder="Título" value={form.heroTitle||''} onChange={e=>setForm({...form, heroTitle:e.target.value})}/>
          <input className="input" placeholder="Subtítulo" value={form.heroSubtitle||''} onChange={e=>setForm({...form, heroSubtitle:e.target.value})}/>
          <input className="input" placeholder="Texto del botón (CTA)" value={form.heroCTA||''} onChange={e=>setForm({...form, heroCTA:e.target.value})}/>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}
