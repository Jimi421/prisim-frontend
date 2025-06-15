// pages/gallery/[slug].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GalleryGrid from "../../components/GalleryGrid";

type GalleryItem = {
  id: string;
  title: string;
  url: string;
};

export default function GalleryPage() {
  const router = useRouter();
  const slug = Array.isArray(router.query.slug)
    ? router.query.slug[0]
    : router.query.slug;

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`/api/gallery?gallery=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<GalleryItem[]>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid gallery data");
        setImages(data);
      })
      .catch((err) => {
        console.error(`Failed to load gallery “${slug}”:`, err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return (
    <>
      <Head>
        <title>Prisim – {slug} Gallery</title>
        <meta name="description" content={`Browse the “${slug}” gallery on Prisim`} />
      </Head>

      <main
        aria-label={`Gallery: ${slug}`}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
          {slug}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <p className="text-center text-gray-500 text-lg">
            No images in “{slug}” yet.
          </p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </main>
    </>
  );
}

