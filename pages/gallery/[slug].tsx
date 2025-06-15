// pages/gallery/[slug].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GalleryGrid from '../../components/GalleryGrid';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
}

export default function GalleryPage() {
  const router = useRouter();
  // router.query.slug is string | string[] | undefined, so cast to string|undefined
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/gallery?gallery=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(res.statusText);
        const data: GalleryItem[] = await res.json();
        setImages(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        Gallery: {slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : ''}
      </h1>

      {loading ? (
        <p>Loading…</p>
      ) : images.length > 0 ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="text-gray-500">No sketches in this gallery yet.</p>
      )}
    </div>
  );
}

