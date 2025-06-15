// pages/index.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import GalleryGrid from "../components/GalleryGrid";

type GalleryItem = {
  id: string;
  title: string;
  url: string;
};

export default function HomePage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Change this if you have other named galleries
  const galleryName = "default";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/gallery?gallery=${galleryName}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid gallery data");
        setImages(data);
      } catch (err: any) {
        console.error("Failed to load gallery:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Prisim – Latest Uploads</title>
        <meta name="description" content="Browse the latest uploads on Prisim" />
        <meta property="og:title" content="Prisim – Art & Sketch Gallery" />
        <meta property="og:description" content="World-class portfolio for digital artists" />
      </Head>

      <main
        aria-label="Art gallery"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Uploads</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-48 rounded-xl"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="bg-red-100 text-red-800 p-4 rounded-lg"
          >
            Error loading gallery: {error}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No sketches uploaded yet.
          </p>
        ) : (
          <>
            <GalleryGrid images={images} />
            <p className="mt-3 text-center text-sm text-gray-500 md:hidden">
              ← Swipe to explore →
            </p>
          </>
        )}
      </main>
    </>
  );
}

