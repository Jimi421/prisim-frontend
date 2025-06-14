import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus("uploading");

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.ok) {
        setStatus("success");
        form.reset();
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">🎨 Welcome to Prisim</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800">Upload Your Artwork</h2>

        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          name="style"
          placeholder="Style (optional)"
          className="w-full border border-gray-300 p-2 rounded"
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          className="w-full border border-gray-300 p-2 rounded"
          rows={3}
        ></textarea>

        <label className="flex items-center space-x-2 text-gray-700">
          <input type="checkbox" name="blackAndWhite" value="1" />
          <span>Black & White</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>

        {status === "uploading" && <p className="text-yellow-600">Uploading...</p>}
        {status === "success" && <p className="text-green-600">✅ Upload complete!</p>}
        {status === "error" && <p className="text-red-600">❌ Upload failed. Try again.</p>}
      </form>
    </main>
  );
}

