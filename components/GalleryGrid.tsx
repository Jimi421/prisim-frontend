import React from "react";
import Card from "./Card";

interface Image {
  id: string;
  title: string;
  url: string;
}

interface GalleryGridProps {
  images: Image[];
  onCardClick?: (id: string) => void;
}

export default function GalleryGrid({ images, onCardClick }: GalleryGridProps) {
  return (
    <div
      role="region"
      aria-label="Latest uploads"
      className="flex overflow-x-auto space-x-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:space-x-0 md:overflow-visible"
    >
      {images.map((img) => (
        <div
          key={img.id}
          className="flex-shrink-0 w-72 snap-start md:w-auto"
        >
          <Card
            title={img.title}
            imageUrl={img.url}
            onClick={() => onCardClick && onCardClick(img.id)}
          />
        </div>
      ))}
    </div>
  );
}

