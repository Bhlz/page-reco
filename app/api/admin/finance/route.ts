import { NextRequest, NextResponse } from 'next/server';
import { getFinance, upsertFinance, deleteFinance, type FinanceEntry } from '@/lib/finance';

export async function GET() {
  const data = await getFinance();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null);
  if (!body) return new Response('Bad Request', { status: 400 });
  const entry: FinanceEntry = {
    id: body.id || `fin-${Date.now()}`,
    date: body.date || new Date().toISOString().slice(0,10),
    concept: String(body.concept||'Sin concepto'),
    channel: body.channel || 'other',
    kind: (body.kind === 'expense') ? 'expense' : 'income',
    amount: Math.max(0, Number(body.amount||0)),
    fees: Number(body.fees||0) || 0,
    tax: Number(body.tax||0) || 0,
    orderId: body.orderId || undefined,
    notes: body.notes || ''
  };
  const saved = await upsertFinance(entry);
  return NextResponse.json({ ok: true, entry: saved });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(()=>null);
  const id = body?.id;
  if (!id) return new Response('Bad Request', { status: 400 });
  await deleteFinance(String(id));
  return NextResponse.json({ ok: true });
}
