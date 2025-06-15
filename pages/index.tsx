// pages/index.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import GalleryGrid from "../components/GalleryGrid";

type GalleryItem = {
  id: string;
  title: string;
  url: string;
  gallery: string;
};

export default function HomePage() {
  const [allImages, setAllImages] = useState<GalleryItem[]>([]);
  const [filtered, setFiltered] = useState<GalleryItem[]>([]);
  const [galleries, setGalleries] = useState<string[]>([]);
  const [selection, setSelection] = useState<string>(""); // "" = All
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sketches (no filter param)
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: GalleryItem[] = await res.json();
        setAllImages(data);
        setFiltered(data);
        // collect unique gallery names
        setGalleries(Array.from(new Set(data.map((img) => img.gallery))));
      } catch (err: any) {
        console.error("Failed to load gallery:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // when user changes selection, re-filter in-memory
  useEffect(() => {
    if (!selection) {
      setFiltered(allImages);
    } else {
      setFiltered(allImages.filter((img) => img.gallery === selection));
    }
  }, [selection, allImages]);

  return (
    <>
      <Head>
        <title>Prisim – All Sketches</title>
      </Head>
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">All Sketches</h1>

        {/* gallery filter dropdown */}
        <div className="mb-6">
          <label className="mr-2">Show:</label>
          <select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            {galleries.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">No sketches found.</p>
        ) : (
          <GalleryGrid
            images={filtered.map(({ id, title, url }) => ({ id, title, url }))}
          />
        )}
      </main>
    </>
  );
}

