import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const runtime = 'edge';

type ImageRow = {
  id: string;
  key: string; // R2 key like "portraits/jane.jpg"
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type GalleryPayload = {
  title?: string | null;
  images?: ImageRow[];
};

function coercePayload(x: unknown): GalleryPayload {
  const out: GalleryPayload = {};
  if (!x || typeof x !== 'object') return out;
  const obj = x as Record<string, unknown>;
  out.title = typeof obj.title === 'string' ? obj.title : null;

  const imgs = obj.images;
  if (Array.isArray(imgs)) {
    out.images = imgs
      .map((r) => {
        if (!r || typeof r !== 'object') return null;
        const o = r as Record<string, unknown>;
        const id = typeof o.id === 'string' ? o.id : crypto.randomUUID();
        const key = typeof o.key === 'string' ? o.key : '';
        if (!key) return null;
        return {
          id,
          key,
          alt: typeof o.alt === 'string' ? o.alt : null,
          width: typeof o.width === 'number' ? o.width : null,
          height: typeof o.height === 'number' ? o.height : null,
        } as ImageRow;
      })
      .filter(Boolean) as ImageRow[];
  } else {
    out.images = [];
  }

  return out;
}

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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = coercePayload(await res.json());

        setTitle(data.title ?? String(slug));
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

