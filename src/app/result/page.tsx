"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

type Status = "processing" | "done" | "failed";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const [status, setStatus] = useState<Status>("processing");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

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
        <div className="rounded-3xl bg-white dark:bg-slate-800 p-10 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-slate-700 dark:to-slate-700">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
          </div>
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-100">AI sedang bekerja...</h2>
          <p className="mt-2 text-sm text-gray-400 dark:text-slate-400">Transformasi foto kamu sedang diproses</p>
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
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-4 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-pink-400">Hasil Transformasi</p>
            <div className="relative overflow-hidden rounded-2xl">
              <Image src={resultUrl} alt="Hasil AI" width={400} height={400}
                className="w-full object-cover" style={{ width: "100%", height: "auto" }}
                loading="eager" />
              <div className="absolute top-2 right-2">
                <span className="rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1 text-xs font-black text-pink-500 dark:text-pink-400 shadow-sm">AI Transformed</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-800 p-5 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700">
            <div className="flex gap-3">
              <button
                onClick={() => setShowQR(true)}
                className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-center text-sm font-black text-white shadow-md shadow-pink-200 dark:shadow-none hover:opacity-90 transition">
                📥 Download
              </button>
              <button onClick={() => router.push("/")}
                className="flex-1 rounded-2xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/30 py-3 text-sm font-bold text-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition">
                Foto Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700 text-center">
          <div className="mb-4 text-5xl">😔</div>
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-100">Gagal diproses</h2>
          <p className="mt-2 mb-5 text-sm text-gray-400 dark:text-slate-400">Foto gagal ditransformasi. Silakan coba lagi.</p>
          <button onClick={() => router.push("/")}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition">
            Coba Lagi
          </button>
        </div>
      )}

      {/* QR Modal */}
      {showQR && resultUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-base font-black text-gray-800 dark:text-slate-100">Scan untuk Download</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-300 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-xl leading-none">×</button>
            </div>
            <p className="mb-5 text-xs text-gray-400 dark:text-slate-400">Arahkan kamera HP ke QR ini untuk membuka & download foto</p>
            <div className="flex justify-center mb-5">
              <div className="rounded-2xl border-2 border-pink-100 dark:border-slate-700 p-3 bg-white inline-block">
                <QRCodeSVG value={resultUrl} size={180} fgColor="#ec4899" />
              </div>
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full rounded-2xl border-2 border-gray-100 dark:border-slate-700 py-2.5 text-sm font-bold text-gray-400 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-5 py-2 shadow-sm border border-pink-100 dark:border-slate-700">
          <span className="text-2xl">📸</span>
          <span className="text-xl font-black text-gray-800 dark:text-slate-100 tracking-tight">AI Photobooth</span>
        </div>
      </header>
      <Suspense fallback={
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-10 text-center shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700">
            <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
          </div>
        </div>
      }>
        <ResultContent />
      </Suspense>
    </main>
  );
}
