// prisim-frontend/components/Lightbox.tsx
import React from 'react';

interface LightboxProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function Lightbox({ url, title, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img src={url} alt={title} className="max-w-full max-h-full" />
    </div>
  );
}

