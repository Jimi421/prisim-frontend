// prisim-frontend/components/Header.tsx
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Prisim
        </Link>
        <nav>
          <Link href="/" className="px-3">Home</Link>
          <Link href="/gallery" className="px-3">Galleries</Link>
        </nav>
      </div>
    </header>
  );
}

