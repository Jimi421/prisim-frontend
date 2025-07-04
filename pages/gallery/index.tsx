// pages/gallery/index.tsx
import Link from 'next/link';

const GALLERIES = [
  { slug: 'landscapes', name: 'Landscapes', cover: '/path/to/sample1.jpg' },
  { slug: 'portraits', name: 'Portraits', cover: '/path/to/sample2.jpg' },
  // Replace with DB/API call later!
];

export default function GalleryIndex() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Galleries</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {GALLERIES.map((g) => (
          <Link key={g.slug} href={`/gallery/${g.slug}`}>
            <div className="rounded-2xl shadow-lg bg-white hover:bg-gray-100 transition p-4 cursor-pointer flex flex-col items-center">
              <img src={g.cover} alt={g.name} className="w-full h-40 object-cover rounded-xl mb-3" />
              <span className="text-lg font-semibold">{g.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

