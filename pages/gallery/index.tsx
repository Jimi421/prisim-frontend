// pages/gallery/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Gallery = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_key?: string | null; // R2 object key like "covers/landscapes.jpg"
};

export const runtime = 'edge';

export default function GalleryIndex() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data.galleries || []);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load');
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">All Galleries</h1>

        {err && <p className="text-red-600">Error: {err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((g) => {
            const thumb = g.cover_key
              ? `/api/images?key=${encodeURIComponent(g.cover_key)}`
              : '/placeholder.png';
            return (
              <Link
                key={g.id}
                href={`/gallery/${encodeURIComponent(g.slug)}`}
                className="block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition"
              >
                <div className="aspect-[16/9] bg-gray-100">
                  {/* regular <img> works great on Pages */}
                  <img
                    src={thumb}
                    alt={g.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg">{g.title}</h2>
                  {g.description ? (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.description}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

