// pages/gallery/[slug].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GalleryGrid from "../../components/GalleryGrid";

type GalleryItem = { id: string; title: string; url: string };

export default function GalleryPage() {
  const { slug } = useRouter().query as { slug?: string };
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/gallery?gallery=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Failed to load gallery:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <>
      <Head>
        <title>Prisim: {slug} Gallery</title>
      </Head>
      <main className="max-w-7xl mx-auto p-6">
        <button onClick={() => history.back()} className="mb-4 text-blue-600">
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-6">
          Gallery: <span className="capitalize">{slug}</span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            Error loading gallery: {error}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-gray-500">No images in this gallery yet.</p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </main>
    </>
  );
}

