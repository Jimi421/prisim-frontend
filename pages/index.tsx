import { useEffect, useState } from "react";

type Sketch = {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
};

export default function HomePage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sketches")
      .then((res) => res.json())
      .then((data) => {
        setSketches(data.sketches);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-white p-4 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Prisim Sketch Gallery</h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sketches.map((sketch) => (
            <div
              key={sketch.id}
              className="rounded-lg overflow-hidden shadow-md border"
            >
              <img
                src={sketch.imageUrl}
                alt={sketch.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-2 text-sm">
                <p className="font-medium">{sketch.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(sketch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <a
        href="/sketch"
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition"
      >
        + Upload
      </a>
    </div>
  );
}

