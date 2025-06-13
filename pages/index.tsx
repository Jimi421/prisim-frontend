import { useEffect, useState } from "react";

type Sketch = {
  id: number;
  title: string;
  createdAt: string;
  imageUrl: string;
  isBlackAndWhite: boolean;
  style: string;
};

export default function HomePage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sketches")
      .then((res) => res.json())
      .then((data: { sketches: Sketch[] }) => {
        setSketches(data.sketches);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Sketches</h1>
      {loading ? (
        <p>Loading sketches...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sketches.map((sketch) => (
            <div key={sketch.id} className="rounded shadow p-2">
              <img
                src={sketch.imageUrl}
                alt={sketch.title}
                className="w-full h-auto rounded"
              />
              <div className="mt-2 text-sm">
                <strong>{sketch.title}</strong>
                <p className="text-gray-500">
                  {sketch.isBlackAndWhite ? "Black & White" : sketch.style}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(sketch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

