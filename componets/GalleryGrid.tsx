// prisim-frontend/components/GalleryGrid.tsx
import React from 'react';
import Card from './Card';

interface Image {
  id: number;
  title: string;
  url: string;
}

interface GalleryGridProps {
  images: Image[];
  onCardClick?: (id: number) => void;
}

export default function GalleryGrid({ images, onCardClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map(img => (
        <Card
          key={img.id}
          title={img.title}
          imageUrl={img.url}
          onClick={() => onCardClick && onCardClick(img.id)}
        />
      ))}
    </div>
  );
}


