// prisim-frontend/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UploadFAB from "../components/UploadFAB";

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const showFAB = pathname !== "/upload";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto p-6 w-full">
        <Component {...pageProps} />
      </main>

      <Footer />

      {showFAB && <UploadFAB />}
    </div>
  );
}

