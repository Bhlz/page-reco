import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'data', 'settings.json');
    const raw = await fs.readFile(p, 'utf-8').catch(()=> '{}');
    const json = JSON.parse(raw || '{}');
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
