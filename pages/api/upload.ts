// components/SketchUploader.tsx
"use client";
import { useState } from "react";

export default function SketchUploader() {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [bw, setBw] = useState(false);
  const [status, setStatus] = useState<string>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus("⚠️ Pick a file first");

    setStatus("⏳ Uploading…");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("style", style);
    fd.append("notes", notes);
    if (bw) fd.append("blackAndWhite", "1");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatus(`✅ Uploaded as ${data.key}`);
      // reset form or refresh gallery…
    } else {
      setStatus(`❌ ${data.error || "Upload failed"}`);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* … your file input, preview, title/style/notes fields … */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Sketch
      </button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  );
}

