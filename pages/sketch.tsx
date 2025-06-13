import { useEffect, useState } from 'react';
import Image from 'next/image';
import SketchUploader from '../components/SketchUploader'; // ✅ Fixed path

interface Sketch {
  id: number;
  slug: string;
  title: string;
  style: string;
  black_and_white: number;
  notes: string;
  url: string;
  created_at: string;
}

export default function SketchPage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSketches() {
    setLoading(true);
    try {
      const res = await fetch('/sketches');
      const data: { ok: boolean; sketches: Sketch[] } = await res.json(); // ✅ Fixed typing
      if (data.ok) {
        setSketches(data.sketches);
      }
    } catch (err) {
      console.error("Error loading sketches:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSketches();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SketchUploader onUploaded={loadSketches} />

      <h2 className="text-2xl font-bold mt-8 mb-4">Gallery</h2>

      {loading ? (
        <p>Loading sketches…</p>
      ) : sketches.length === 0 ? (
        <p>No sketches yet. Upload one!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sketches.map((sketch) => (
            <div key={sketch.id} className="border rounded shadow p-2 bg-white">
              <Image
                src={sketch.url}
                alt={sketch.title}
                width={400}
                height={300}
                className="object-cover w-full h-auto rounded"
              />
              <div className="mt-2">
                <h3 className="font-semibold text-lg">{sketch.title}</h3>
                <p className="text-sm text-gray-600">{sketch.style}</p>
                {sketch.black_and_white === 1 && (
                  <p className="text-xs text-gray-500">🖤 Black & White</p>
                )}
                {sketch.notes && <p className="text-xs mt-1">{sketch.notes}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(sketch.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

