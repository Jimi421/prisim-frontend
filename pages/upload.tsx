// pages/upload.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  file: FileList;
  title: string;
  style: string;
  blackAndWhite: boolean;
  notes: string;
};

export default function UploadPage() {
  const { register, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    defaultValues: { title: "", style: "", blackAndWhite: false, notes: "" },
  });
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileList = watch("file");
  const previewUrl = fileList && fileList.length > 0 ? URL.createObjectURL(fileList[0]) : null;

  // revoke preview URL on cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit = async (data: FormValues) => {
    setStatus(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("title", data.title);
    formData.append("style", data.style);
    formData.append("blackAndWhite", data.blackAndWhite.toString());
    formData.append("notes", data.notes);

    // use XHR for progress events
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const resp = JSON.parse(xhr.responseText);
        if (resp.ok) {
          setStatus(`✅ Uploaded: ${resp.key}`);
          reset();
          setProgress(0);
        } else {
          setStatus(`❌ ${resp.error || "Upload failed"}`);
        }
      } else {
        setStatus(`❌ Server error: ${xhr.status}`);
      }
    };
    xhr.onerror = () => setStatus("❌ Network error");
    xhr.send(formData);
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Upload a Sketch</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">File</label>
          <input
            {...register("file", { required: true })}
            type="file"
            accept="image/*"
            className="block w-full"
          />
          {formState.errors.file && <p className="text-red-600">Please select a file.</p>}
        </div>

        {previewUrl && (
          <div className="border p-2">
            <p className="text-sm mb-1">Preview:</p>
            <img src={previewUrl} className="max-h-48 object-contain" alt="Preview" />
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            {...register("title", { required: true })}
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="My beautiful tree"
          />
          {formState.errors.title && <p className="text-red-600">Title is required.</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Style</label>
          <input
            {...register("style")}
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="e.g. watercolour, pen"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input {...register("blackAndWhite")} type="checkbox" id="bw" />
          <label htmlFor="bw">Black &amp; White</label>
        </div>

        <div>
          <label className="block font-medium mb-1">Notes</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full border rounded px-2 py-1"
            placeholder="Any thoughts or context…"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={progress > 0 && progress < 100}
        >
          {progress > 0 && progress < 100 ? `Uploading… ${progress}%` : "Upload Sketch"}
        </button>
      </form>

      {status && <p className="mt-4 font-medium">{status}</p>}
    </main>
  );
}

