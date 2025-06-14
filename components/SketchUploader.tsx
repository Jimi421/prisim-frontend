import { useRef, useState } from 'react';

export default function SketchUploader({ onUploaded }: { onUploaded: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    setStatus("Uploading…");

    try {
      const res = await fetch('/api/uploads', {
        method: "POST",
        body: formData,
      });

      const json: { ok: boolean; error?: string } = await res.json();

      if (json.ok) {
        setStatus("✅ Uploaded!");
        onUploaded();
        form.reset();
      } else {
        setStatus("❌ Upload failed: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 border p-4 rounded bg-white shadow">
      <h2 className="font-semibold text-xl">Upload a Sketch</h2>

      <input type="file" name="file" required className="block w-full" />

      <input
        type="text"
        name="title"
        placeholder="Title"
        required
        className="block w-full border p-2 rounded"
      />

      <input
        type="text"
        name="style"
        placeholder="Style (e.g., ink, watercolor)"
        className="block w-full border p-2 rounded"
      />

      <textarea
        name="notes"
        placeholder="Notes"
        className="block w-full border p-2 rounded"
      />

      <label className="block">
        <input type="checkbox" name="blackAndWhite" value="true" className="mr-1" />
        Black and White
      </label>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
        Upload
      </button>

      <p className="text-sm text-gray-600">{status}</p>
    </form>
  );
}

