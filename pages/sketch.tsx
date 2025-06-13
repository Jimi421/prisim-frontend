import { useEffect, useState } from "react";

type Sketch = {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
};

export default function SketchPage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);

  useEffect(() => {
    fetch("/api/sketches")
      .then((res) => res.json())
      .then((data: { sketches: Sketch[] }) => setSketches(data.sketches))
      .catch((err) => console.error("Failed to load sketches:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Sketches</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sketches.map((sketch) => (
          <div key={sketch.id} className="border rounded p-2">
            <img src={sketch.imageUrl} alt={sketch.title} className="w-full h-auto rounded" />
            <h2 className="text-sm mt-2 font-medium">{sketch.title}</h2>
            <p className="text-xs text-gray-500">{new Date(sketch.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

