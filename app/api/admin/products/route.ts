import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, saveProducts } from '@/lib/store';

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  const products = await getAllProducts();
  const idx = products.findIndex(p => p.slug === body.slug);
  const p = {
    slug: String(body.slug),
    name: String(body.name),
    price: Number(body.price || 0),
    images: Array.isArray(body.images) ? body.images : [],
    rating: Number(body.rating || 0),
    reviews: Number(body.reviews || 0),
    category: String(body.category || ''),
    description: String(body.description || ''),
    stock: Number(body.stock || 0),
    variants: Array.isArray(body.variants) ? body.variants : undefined,
    bundleSkus: Array.isArray(body.bundleSkus) ? body.bundleSkus : undefined,
  };
  if (idx >= 0) products[idx] = p; else products.push(p);
  await saveProducts(products);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  const slug = String(body.slug || '');
  if (!slug) return new Response('Bad Request', { status: 400 });
  const products = await getAllProducts();
  const filtered = products.filter(p => p.slug !== slug);
  await saveProducts(filtered);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  // same as POST (upsert)
  return POST(req);
}
