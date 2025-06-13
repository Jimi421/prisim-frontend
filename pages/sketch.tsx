// pages/sketch.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import SketchUploader from '@/components/SketchUploader';

interface Sketch { /* same as before */ }

export default function SketchPage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/sketches')
      .then(r => r.json())
      .then(d => {
        setSketches(d.sketches);
        setLoading(false);
      });
  };

  useEffect(load, []);

  return (
    <main className="p-4 space-y-8">
      <SketchUploader onUploaded={load} />

      <h1 className="text-3xl font-bold">My Sketches</h1>
      {loading
        ? <p>Loading…</p>
        : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {sketches.map(s => (
              <div key={s.id} className="border rounded shadow p-2">
                <Image
                  src={s.url}
                  alt={s.title}
                  width={400} height={300}
                  className="rounded"
                />
                <h2 className="mt-2 font-semibold">{s.title}</h2>
                <p className="text-sm text-gray-600">
                  {s.style} | B&W: {s.blackAndWhite ? 'Yes' : 'No'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
                {s.notes && <p className="mt-1 text-sm">{s.notes}</p>}
              </div>
            ))}
          </div>
        )}
    </main>
  );
}

