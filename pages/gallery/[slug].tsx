// prisim-frontend/pages/gallery/[slug].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import GalleryGrid from '../../components/GalleryGrid';

interface Image {
  id: number;
  title: string;
  url: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/images?gallery=${slug}`)
      .then(res => res.json())
      .then(data => setImages(data));
  }, [slug]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gallery: {slug}</h2>
      <GalleryGrid images={images} />
    </div>
  );
}

