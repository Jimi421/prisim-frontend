// pages/upload.tsx
import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [style, setStyle] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus('Please choose a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);
    formData.append('title', title);
    formData.append('notes', notes);
    formData.append('style', style);

    setStatus('Uploading...');

    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.ok) {
      setStatus('Uploaded!');
      setFile(null);
      setSlug('');
      setTitle('');
      setNotes('');
      setStyle('');
    } else {
      setStatus(`Error: ${data.error || 'Upload failed'}`);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Upload Sketch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Style (e.g. watercolor, pen)"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-black text-white w-full py-2 rounded hover:bg-gray-800"
        >
          Upload
        </button>
        {status && <p className="text-center text-sm">{status}</p>}
      </form>
    </div>
  );
}

