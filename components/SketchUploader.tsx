// components/SketchUploader.tsx
import React, { useRef, useState, useEffect } from 'react';

interface SketchUploaderProps {
  onUploaded: () => void;
}

export default function SketchUploader({ onUploaded }: SketchUploaderProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setRotation(0);
    setStatus('');
  };

  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);

  const prepareUploadFile = async (): Promise<File> => {
    if (!preview || rotation % 360 === 0) return file!;
    return new Promise<File>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const angle = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(angle));
        const cos = Math.abs(Math.cos(angle));
        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob((blob) => {
          if (blob) {
            const rotatedFile = new File([blob], file!.name, { type: file!.type });
            resolve(rotatedFile);
          } else {
            reject(new Error('Canvas is empty'));
          }
        }, file!.type);
      };
      img.onerror = reject;
      img.src = preview;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || !file) return;
    setStatus('Uploading...');

    try {
      const rotatedFile = await prepareUploadFile();
      const formData = new FormData(form);
      formData.set('file', rotatedFile, rotatedFile.name);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const json: { ok: boolean; error?: string } = await res.json();

      if (json.ok) {
        setStatus('✅ Uploaded!');
        onUploaded();
        form.reset();
        setFile(null);
        setPreview(null);
      } else {
        setStatus('❌ Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded bg-white shadow sm:max-w-md mx-auto"
    >
      <h2 className="font-semibold text-xl text-center">Upload a Sketch</h2>

      <div className="flex flex-col items-center">
        {!preview && (
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        )}

        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 rounded"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center space-x-2">
              <button type="button" onClick={rotateLeft} className="bg-gray-800 text-white p-2 rounded-full">
                ↺
              </button>
              <button type="button" onClick={rotateRight} className="bg-gray-800 text-white p-2 rounded-full">
                ↻
              </button>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <>
          <input type="text" name="title" placeholder="Title" required className="block w-full border p-2 rounded" />
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
            rows={3}
          />
          <input
            type="text"
            name="gallery"
            placeholder="Gallery (e.g., default, trees, animals)"
            required
            className="block w-full border p-2 rounded"
          />
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="blackAndWhite" value="1" className="rounded" />
            <span>Black & White</span>
          </label>
        </>
      )}

      <button
        type="submit"
        disabled={!file}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Upload
      </button>

      {status && <p className="text-center text-gray-600">{status}</p>}
    </form>
  );
}

