// pages/gallery/[slug].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GalleryGrid from '@/components/GalleryGrid';

export default function GalleryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const res = await fetch(`/api/gallery?gallery=${slug}`);
      const json = await res.json();
      setImages(json);
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Gallery: {slug}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : images.length > 0 ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="text-gray-500">No sketches in this gallery yet.</p>
      )}
    </div>
  );
}

