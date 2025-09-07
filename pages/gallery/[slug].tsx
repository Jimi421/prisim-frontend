import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const runtime = 'experimental-edge';

type ImageRow = {
  id: string;
  key: string; // R2 key like "portraits/jane.jpg"
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export default function GalleryDetail() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [title, setTitle] = useState<string>('');
  const [images, setImages] = useState<ImageRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const res = await fetch(`/api/sketches?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const imgs = Array.isArray(raw)
          ? raw
              .map((r: any) => {
                if (!r || typeof r !== 'object') return null;
                const id = typeof r.id === 'string' ? r.id : crypto.randomUUID();
                const key = typeof r.key === 'string' ? r.key : '';
                if (!key) return null;
                return {
                  id,
                  key,
                  alt: typeof r.title === 'string' ? r.title : null,
                  width: typeof r.width === 'number' ? r.width : null,
                  height: typeof r.height === 'number' ? r.height : null,
                } as ImageRow;
              })
              .filter(Boolean)
          : [];
        setTitle(String(slug));
        setImages(imgs as ImageRow[]);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load');
      }
    })();
  }, [slug]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">{title || 'Gallery'}</h1>
        {err && <p className="text-red-600 mb-4">Error: {err}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => {
            const src = `/api/images?key=${encodeURIComponent(img.key)}`;
            return (
              <div key={img.id} className="rounded-xl overflow-hidden bg-neutral-50">
                <img
                  src={src}
                  alt={img.alt ?? ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

