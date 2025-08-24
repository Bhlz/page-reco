import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrderByExternalRef } from '@/lib/store';

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  const id = String(body.id || '');
  if (!id) return new Response('Missing id', { status: 400 });

  const patch: any = {};
  if (body.shipment) patch.shipment = body.shipment;
  if (body.invoice) patch.invoice = body.invoice;
  if (body.status) patch.status = body.status;

  await updateOrderByExternalRef(id, patch);
  return NextResponse.json({ ok: true });
}
