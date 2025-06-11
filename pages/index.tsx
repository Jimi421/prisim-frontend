// prisim-frontend/pages/index.tsx
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold">Welcome to Prisim</h1>
      <p className="text-lg">A world-class gallery for artists to upload and share their work.</p>
      <Link href="/gallery/">
        <a className="px-6 py-3 bg-blue-600 text-white rounded-lg">Browse Galleries</a>
      </Link>
    </div>
  );
}

