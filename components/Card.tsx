import React from "react";
import Image from "next/image";

interface CardProps {
  title: string;
  imageUrl: string; // e.g. "/api/abc123"
  onClick?: () => void;
}

export default function Card({ title, imageUrl, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`View ${title}`}
      className="cursor-pointer bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="relative aspect-w-4 aspect-h-3 bg-gray-100 dark:bg-zinc-700">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white truncate">
        {title}
      </div>
    </button>
  );
}

