// pages/gallery/[slug].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Image {
  id: string;
  url: string;
  title?: string;
}

interface GalleryApiResponse {
  title?: string;
  images?: Image[];
  error?: string;
}

export default function GallerySlug() {
  const router = useRouter();
  const { slug } = router.query;

  const [title, setTitle] = useState<string>("");
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait until the router provides a real slug
    if (!slug) return;

    // Make sure we have a plain string
    const slugStr = Array.isArray(slug) ? slug[0] : slug;

    const run = async () => {
      try {
        const res = await fetch(`/api/gallery?slug=${encodeURIComponent(slugStr)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: GalleryApiResponse = await res.json();
        if (data.error) throw new Error(data.error);

        setTitle(data.title ?? slugStr);
        setImages(data.images ?? []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load gallery";
        setError(msg);
      }
    };

    void run();
  }, [slug]);

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {images.length === 0 ? (
        <p className="text-gray-500">No images found for this gallery.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="border rounded-lg overflow-hidden">
              <img
                src={img.url}
                alt={img.title || "Untitled"}
                className="w-full h-48 object-cover"
              />
              {img.title && (
                <p className="text-center p-2 text-sm">{img.title}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

