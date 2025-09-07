import Link from 'next/link';
import { useEffect, useState } from 'react';

export const runtime = 'experimental-edge';

type Gallery = {
  id?: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  coverKey?: string | null; // optional R2 key for a cover image
};

function coerceGalleries(x: unknown): Gallery[] {
  if (!Array.isArray(x)) return [];
  return x
    .map((g) => {
      if (!g || typeof g !== 'object') return null;
      const obj = g as Record<string, unknown>;
      const slug = typeof obj.slug === 'string' ? obj.slug : '';
      if (!slug) return null;
      return {
        id: typeof obj.id === 'string' ? obj.id : undefined,
        slug,
        title: typeof obj.title === 'string' ? obj.title : null,
        description:
          typeof obj.description === 'string' ? obj.description : null,
        coverKey:
          typeof obj.cover_key === 'string' ? obj.cover_key : null,
      } as Gallery;
    })
    .filter(Boolean) as Gallery[];
}

export default function GalleryIndex() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        setGalleries(coerceGalleries(data));
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load galleries');
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">All Galleries</h1>
        {err && <p className="text-red-600 mb-4">Error: {err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleries.map((g) => {
            const coverSrc = g.coverKey
              ? `/api/images?key=${encodeURIComponent(g.coverKey)}`
              : undefined;
            return (
              <Link
                key={g.slug}
                href={`/gallery/${encodeURIComponent(g.slug)}`}
                className="block rounded-2xl overflow-hidden shadow-sm bg-white hover:shadow-md transition"
              >
                <div className="aspect-[16/9] bg-neutral-100">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={g.title ?? g.slug}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">
                    {g.title ?? g.slug}
                  </h2>
                  {g.description ? (
                    <p className="text-sm text-neutral-600 line-clamp-2 mt-1">
                      {g.description}
                    </p>
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

