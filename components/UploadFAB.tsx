import Link from "next/link";

export default function UploadFAB() {
  return (
    <Link
      href="/upload"
      aria-label="Upload a sketch"
      className="group fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl font-bold shadow-xl
                 hover:bg-blue-700 hover:scale-105 hover:shadow-2xl
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                 transition-all duration-200 ease-out
                 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      +
      <span className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 group-hover:opacity-100 group-hover:block transition-opacity">
        Upload a Sketch
      </span>
    </Link>
  );
}

