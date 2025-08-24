import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'settings.json');

async function ensure() {
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
  try { await fs.stat(FILE); } catch { await fs.writeFile(FILE, JSON.stringify({}, null, 2), 'utf-8'); }
}

export async function GET() {
  await ensure();
  const raw = await fs.readFile(FILE, 'utf-8').catch(()=> '{}');
  const json = JSON.parse(raw || '{}');
  return NextResponse.json(json);
}

export async function POST(req: NextRequest) {
  await ensure();
  const body = await req.json().catch(()=> ({}));
  await fs.writeFile(FILE, JSON.stringify(body || {}, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}
