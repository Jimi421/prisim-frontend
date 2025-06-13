// pages/upload.tsx
'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.ok) {
      setStatus(`✅ Uploaded: ${data.key}`);
    } else {
      setStatus(`❌ Error: ${data.error || 'Upload failed'}`);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Upload Artwork</h1>
      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  );
}

