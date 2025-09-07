// pages/gallery/[slug].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type ImageRow = {
  id: string;
  key: string;       // R2 key, e.g. "portraits/jane.jpg"
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

export const runtime = 'edge';

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
        const res = await fetch(`/api/images?gallery=${encodeURIComponent(slug)}`);
        // ^ if your existing list endpoint is /api/images?gallery=... ; if not,
        // change to whatever your app uses to fetch images by gallery slug.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTitle(data.title ?? slug);
        setImages(data.images ?? []);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load');
      }
    })();
  }, [slug]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">{title || 'Gallery'}</h1>
        {err && <p className="text-red-600">Error: {err}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => {
            const src = `/api/images?key=${encodeURIComponent(img.key)}`;
            return (
              <div key={img.id} className="rounded-lg overflow-hidden bg-gray-50">
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

