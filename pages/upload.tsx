import { useState, ChangeEvent } from "react";

export default function UploadPage() {
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setStatus("Uploading...");

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data: { ok: boolean; key?: string; error?: string } = await res.json();

    if (data.ok) {
      setStatus(`✅ Uploaded: ${data.key}`);
    } else {
      setStatus(`❌ Error: ${data.error || "Upload failed"}`);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload a File</h1>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      <p className="mt-4 text-sm text-gray-700">{status}</p>
    </main>
  );
}

