'use client';
import useSWR from 'swr';
import { useMemo, useState } from 'react';

const fetcher = (u:string)=> fetch(u).then(r=>r.json());

export default function AdminFinance() {
  const { data, mutate } = useSWR('/api/admin/finance', fetcher);
  const entries = data?.entries || [];
  const totals = data?.totals || { gross:0, fees:0, tax:0, net:0 };
  const [form, setForm] = useState<any>({ kind:'income', date:'', concept:'', amount:0, fees:0, tax:0, channel:'mercadopago', orderId:'', notes:'' });
  const [editingId, setEditingId] = useState<string|null>(null);

  const monthly = useMemo(()=>{
    const map: Record<string, number> = {};
    for (const e of entries) {
      const ym = String(e.date||'').slice(0,7);
      const val = (e.kind==='income'?1:-1) * Number(e.amount||0) + (e.kind==='income'?-1:1) * (Number(e.fees||0)+Number(e.tax||0));
      map[ym] = (map[ym]||0) + val;
    }
    return Object.entries(map).sort(([a],[b])=> a.localeCompare(b));
  }, [entries]);

  async function submit(e: any) {
    e.preventDefault();
    const payload = { ...form };
    if (editingId) payload.id = editingId;
    await fetch('/api/admin/finance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    setForm({ kind:'income', date:'', concept:'', amount:0, fees:0, tax:0, channel:'mercadopago', orderId:'', notes:'' });
    setEditingId(null);
    mutate();
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar movimiento?')) return;
    await fetch('/api/admin/finance', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    mutate();
  }

  function edit(e: any) {
    setEditingId(e.id);
    setForm({ ...e });
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <div className="text-sm text-neutral-600">Neto acumulado: <span className={totals.net>=0?'text-emerald-600':'text-rose-600'}>${(totals.net||0).toFixed(2)} MXN</span></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm text-neutral-500">Ingresos brutos</div>
          <div className="text-2xl font-bold">${(totals.gross||0).toFixed(2)} MXN</div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-500">Comisiones + Impuestos</div>
          <div className="text-2xl font-bold">${((totals.fees||0)+(totals.tax||0)).toFixed(2)} MXN</div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-500">Neto</div>
          <div className={"text-2xl font-bold " + (totals.net>=0?'text-emerald-600':'text-rose-600') }>${(totals.net||0).toFixed(2)} MXN</div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-3 md:grid-cols-2">
        <select className="input" value={form.kind} onChange={e=>setForm({...form, kind: e.target.value})}>
          <option value="income">Ingreso</option>
          <option value="expense">Egreso</option>
        </select>
        <input className="input" type="date" value={form.date||''} onChange={e=>setForm({...form, date: e.target.value})} />
        <input className="input md:col-span-2" placeholder="Concepto" value={form.concept||''} onChange={e=>setForm({...form, concept: e.target.value})} />
        <input className="input" placeholder="Monto" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount: Number(e.target.value)})} />
        <input className="input" placeholder="Comisiones" type="number" step="0.01" value={form.fees} onChange={e=>setForm({...form, fees: Number(e.target.value)})} />
        <input className="input" placeholder="Impuestos (IVA/ISR)" type="number" step="0.01" value={form.tax} onChange={e=>setForm({...form, tax: Number(e.target.value)})} />
        <select className="input" value={form.channel} onChange={e=>setForm({...form, channel: e.target.value})}>
          <option value="mercadopago">Mercado Pago</option>
          <option value="cash">Efectivo</option>
          <option value="transfer">Transferencia</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
          <option value="other">Otro</option>
        </select>
        <input className="input" placeholder="OrderId (opcional)" value={form.orderId||''} onChange={e=>setForm({...form, orderId: e.target.value})}/>
        <textarea className="input md:col-span-2 h-24" placeholder="Notas" value={form.notes||''} onChange={e=>setForm({...form, notes: e.target.value})}/>
        <div className="md:col-span-2 flex justify-end gap-2">
          {editingId && <button type="button" className="btn" onClick={()=>{ setEditingId(null); setForm({ kind:'income', date:'', concept:'', amount:0, fees:0, tax:0, channel:'mercadopago', orderId:'', notes:'' }); }}>Cancelar</button>}
          <button className="btn-primary">{editingId ? 'Actualizar' : 'Agregar'}</button>
        </div>
      </form>

      <div className="mt-10">
        <div className="font-semibold mb-3">Movimientos</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr>
                <th className="p-2">Fecha</th>
                <th className="p-2">Concepto</th>
                <th className="p-2">Canal</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Monto</th>
                <th className="p-2">Fees</th>
                <th className="p-2">Impuestos</th>
                <th className="p-2">Neto</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e:any)=>(
                <tr key={e.id} className="border-t">
                  <td className="p-2">{e.date}</td>
                  <td className="p-2">{e.concept}</td>
                  <td className="p-2">{e.channel||'—'}</td>
                  <td className="p-2">{e.kind==='income'?'Ingreso':'Egreso'}</td>
                  <td className="p-2">${Number(e.amount||0).toFixed(2)}</td>
                  <td className="p-2">${Number(e.fees||0).toFixed(2)}</td>
                  <td className="p-2">${Number(e.tax||0).toFixed(2)}</td>
                  <td className={"p-2 " + (((e.kind==='income'?1:-1)*Number(e.amount||0) + (e.kind==='income'?-1:1)*(Number(e.fees||0)+Number(e.tax||0)))>=0?'text-emerald-600':'text-rose-600')}>
                    ${(((e.kind==='income'?1:-1)*Number(e.amount||0) + (e.kind==='income'?-1:1)*(Number(e.fees||0)+Number(e.tax||0))).toFixed(2))}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <button className="btn mr-2" onClick={()=>edit(e)}>Editar</button>
                    <button className="btn" onClick={()=>del(e.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
