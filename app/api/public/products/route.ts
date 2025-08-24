import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/store';

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}
