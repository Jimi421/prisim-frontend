import { useEffect, useState } from "react";
import GalleryGrid from "../components/GalleryGrid";

type GalleryItem = {
  id: string;
  title: string;
  url: string;
};

export default function HomePage() {
  const [images, setImages] = useState<GalleryItem[]>([]);

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Invalid gallery data:", data);
        setImages([]);
        return;
      }
      setImages(data);
    } catch {
      setImages([]);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
        Latest Uploads
      </h1>

      {images.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No sketches uploaded yet.</p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </section>
  );
}

