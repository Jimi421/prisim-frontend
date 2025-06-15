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

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/gallery?gallery=default")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<GalleryItem[]>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid data format");
        setImages(data);
      })
      .catch((err) => {
        console.error("Failed to load gallery:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
          Latest Uploads
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-zinc-700 h-48 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg"
          >
            Error loading gallery: {error}
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No sketches uploaded yet.</p>
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

