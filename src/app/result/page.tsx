"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

type Status = "processing" | "done" | "failed";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [status, setStatus] = useState<Status>("processing");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/photos/${id}`);
    const data = await res.json();
    setStatus(data.status);
    if (data.resultUrl) setResultUrl(data.resultUrl);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    poll();
    const interval = setInterval(() => {
      if (status === "processing") poll();
      else clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, status, poll]);

  return (
    <div className="mx-auto max-w-md px-4 pb-10">
      {status === "processing" && (
        <div className="rounded-3xl bg-white p-10 shadow-lg shadow-pink-100 border border-pink-50 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-cyan-100">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
          </div>
          <h2 className="text-lg font-black text-gray-800">AI sedang bekerja...</h2>
          <p className="mt-2 text-sm text-gray-400">Transformasi foto kamu sedang diproses</p>
          <div className="mt-5 flex justify-center gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="h-2 w-2 rounded-full bg-pink-300 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {status === "done" && resultUrl && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-4 shadow-lg shadow-pink-100 border border-pink-50">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-pink-400">Hasil Transformasi</p>
            <div className="relative overflow-hidden rounded-2xl">
              <Image src={resultUrl} alt="Hasil AI" width={400} height={400}
                className="w-full object-cover" style={{ width: "100%", height: "auto" }}
                loading="eager" />
              <div className="absolute top-2 right-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-pink-500 shadow-sm">AI Transformed</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-lg shadow-pink-100 border border-pink-50">
            <div className="flex gap-3 mb-3">
              <a href={resultUrl} download="ai-photobooth.jpg"
                className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-center text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition">
                Download
              </a>
              <button onClick={() => router.push("/")}
                className="flex-1 rounded-2xl border-2 border-cyan-200 bg-cyan-50 py-3 text-sm font-bold text-cyan-500 hover:bg-cyan-100 transition">
                Foto Lagi
              </button>
            </div>
            <div className="flex gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent("Lihat foto AI saya! " + resultUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-green-50 border border-green-100 py-2 text-center text-xs font-bold text-green-600 hover:bg-green-100 transition">
                Share WA
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-pink-50 border border-pink-100 py-2 text-center text-xs font-bold text-pink-500 hover:bg-pink-100 transition">
                Share IG
              </a>
            </div>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-pink-100 border border-pink-50 text-center">
          <div className="mb-4 text-5xl">😔</div>
          <h2 className="text-lg font-black text-gray-800">Gagal diproses</h2>
          <p className="mt-2 mb-5 text-sm text-gray-400">Foto gagal ditransformasi. Silakan coba lagi.</p>
          <button onClick={() => router.push("/")}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition">
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-cyan-100">
      <header className="px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 shadow-sm border border-pink-100">
          <span className="text-2xl">📸</span>
          <span className="text-xl font-black text-gray-800 tracking-tight">AI Photobooth</span>
        </div>
      </header>
      <Suspense fallback={
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-pink-100 border border-pink-50">
            <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
          </div>
        </div>
      }>
        <ResultContent />
      </Suspense>
    </main>
  );
}
