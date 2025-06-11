// prisim-frontend/components/Card.tsx
import React from 'react';

interface CardProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
}

export default function Card({ title, imageUrl, onClick }: CardProps) {
  return (
    <div
      className="rounded-2xl shadow-md overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );
}

