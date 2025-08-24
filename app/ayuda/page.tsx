'use client';
import useSWR from 'swr';

const fetcher = (u:string)=> fetch(u).then(r=>r.json());

export default function Page() { 
  const { data } = useSWR('/api/public/settings', fetcher);
  const html = data?.help || '';
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold">Ayuda</h1>
      <div className="prose prose-neutral mt-6" dangerouslySetInnerHTML={{ __html: html || '<p>Sin contenido configurado.</p>' }} />
    </div>
  );
}
