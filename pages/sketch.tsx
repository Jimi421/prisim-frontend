// pages/sketch.tsx
import { useEffect, useState } from "react";
import Image from "next/image";

interface Sketch {
  id: number;
  title: string;
  url: string;
  style: string;
  blackAndWhite: boolean;
  createdAt: string;
}

export default function SketchPage() {
  const [sketches, setSketches] = useState<Sketch[]>([]);

  useEffect(() => {
    fetch("/api/sketches")
      .then((res) => res.json())
      .then((data) => setSketches(data.sketches));
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">My Sketches</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sketches.map((sketch) => (
          <div key={sketch.id} className="border rounded-lg p-2 shadow">
            <Image
              src={sketch.url}
              alt={sketch.title}
              width={400}
              height={300}
              className="rounded"
            />
            <div className="mt-2">
              <h2 className="text-xl font-semibold">{sketch.title}</h2>
              <p className="text-sm text-gray-600">
                Style: {sketch.style} | BW: {sketch.blackAndWhite ? "Yes" : "No"}
              </p>
              <p className="text-xs text-gray-400">{new Date(sketch.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

