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

    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const json = await res.json();
    if (json.ok) {
      setStatus("Uploaded!");
      onUploaded();
      form.reset();
    } else {
      setStatus("Upload failed: " + json.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2 border p-4 rounded">
      <h2 className="font-semibold text-xl">Upload a Sketch</h2>
      <input type="file" name="file" required className="block" />
      <input type="text" name="title" placeholder="Title" className="block w-full border p-1" />
      <input type="text" name="style" placeholder="Style" className="block w-full border p-1" />
      <textarea name="notes" placeholder="Notes" className="block w-full border p-1" />
      <label className="block">
        <input type="checkbox" name="blackAndWhite" value="true" />
        Black and White
      </label>
      <button type="submit" className="bg-black text-white px-4 py-1 rounded">Upload</button>
      <p className="text-sm text-gray-600">{status}</p>
    </form>
  );
}

