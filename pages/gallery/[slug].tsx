import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Image = {
  id: number;
  gallery: string;
  url: string;
  created_at: string;
};

export default function GalleryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/images?gallery=${slug}`)
      .then(res => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setImages(data as Image[]);
        } else {
          console.error('Expected an array of images but got:', data);
        }
      })
      .catch(err => {
        console.error('Error fetching images:', err);
      });
  }, [slug]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gallery: {slug}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="border rounded shadow">
            <img src={img.url} alt={`Image ${img.id}`} className="w-full h-auto" />
            <div className="text-sm text-gray-500 p-2">{new Date(img.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

