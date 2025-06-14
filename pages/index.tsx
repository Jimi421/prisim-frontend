import { useEffect, useState } from "react";
import SketchUploader from "../components/SketchUploader";
import GalleryGrid from "../components/GalleryGrid";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
      const data: GalleryItem[] = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto p-6 space-y-10">
        <SketchUploader onUploaded={fetchGallery} />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Latest Uploads</h2>
          {images.length === 0 ? (
            <p className="text-gray-500">No sketches uploaded yet.</p>
          ) : (
            <GalleryGrid images={images} />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

