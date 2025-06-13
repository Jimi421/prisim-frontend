// components/SketchUploader.tsx
import { useState, useRef } from 'react';

export default function SketchUploader({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File|null>(null);
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('pen');
  const [blackAndWhite, setBlackAndWhite] = useState(false);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
  }

  function upload() {
    if (!file) return setStatus('Select a file first');
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('style', style);
    form.append('blackAndWhite', blackAndWhite ? 'on' : '');
    form.append('notes', notes);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (data.ok) {
        setStatus(`✅ Uploaded as ${data.key}`);
        setFile(null);
        setTitle('');
        setNotes('');
        setProgress(0);
        onUploaded();
      } else {
        setStatus('❌ Upload failed');
      }
    };
    xhr.onerror = () => setStatus('❌ Upload error');
    xhr.send(form);
  }

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="p-4 border-2 border-dashed rounded-lg text-center"
    >
      {file ? (
        <div className="mb-2">
          <p className="font-semibold">{file.name}</p>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="mx-auto max-h-40"
          />
        </div>
      ) : (
        <p>Drag & drop a sketch here, or <button
          type="button"
          className="text-blue-600 underline"
          onClick={() => inputRef.current?.click()}
        >browse</button></p>
      )}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={inputRef}
        onChange={e => e.target.files && setFile(e.target.files[0])}
      />

      <div className="mt-4 flex flex-col space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded p-1"
        />
        <select
          value={style}
          onChange={e => setStyle(e.target.value)}
          className="border rounded p-1"
        >
          <option value="pen">Pen</option>
          <option value="watercolour">Watercolour</option>
          <option value="digital">Digital</option>
        </select>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={blackAndWhite}
            onChange={e => setBlackAndWhite(e.target.checked)}
            className="mr-2"
          />
          Black & White
        </label>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="border rounded p-1"
        />
        <button
          onClick={upload}
          className="bg-blue-600 text-white rounded py-2 disabled:opacity-50"
          disabled={!file}
        >
          Upload
        </button>
      </div>

      {progress > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}

