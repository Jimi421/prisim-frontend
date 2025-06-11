// prisim-frontend/components/Footer.tsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 p-6 mt-12">
      <div className="max-w-5xl mx-auto text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Prisim. All rights reserved.
      </div>
    </footer>
  );
}

