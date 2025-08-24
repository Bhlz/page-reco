import Image from 'next/image';

import fs from 'fs/promises';
import path from 'path';

async function loadSettings() {
  try {
    const txt = await fs.readFile(path.join(process.cwd(), 'data', 'settings.json'), 'utf-8');
    return JSON.parse(txt || '{}');
  } catch { return {} as any; }
}

import Hero from '@/components/Hero';
import Collections from '@/components/Collections';
import ReviewsUGC from '@/components/ReviewsUGC';
import Benefits from '@/components/Benefits';
import Story from '@/components/Story';
import FAQ from '@/components/FAQ';

export default function Page() {
  return (
    <>
      <Hero/>
      <Collections/>
      <ReviewsUGC/>
      <Benefits/>
      <Story/>
      <FAQ/>
    </>
  );
}
