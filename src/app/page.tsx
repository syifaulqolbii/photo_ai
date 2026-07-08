"use client";

import { useState, useRef } from "react";
import { THEMES } from "@/lib/themes";
import { CameraCapture } from "@/components/CameraCapture";
import { ThemeCard } from "@/components/ThemeCard";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Step = "capture" | "theme" | "processing";

export default function HomePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("theme");
  }

  async function handleProcess() {
    if (!file || !selectedTheme) return;
    setStep("processing");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/photos/upload", { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error("Upload gagal");
      const { photoId } = await uploadRes.json();
      const processRes = await fetch("/api/photos/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, theme: selectedTheme }),
      });
      if (!processRes.ok) throw new Error("Proses AI gagal");
      router.push(`/result?id=${photoId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setStep("theme");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-cyan-100">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2 shadow-sm border border-pink-100">
          <span className="text-2xl">📸</span>
          <span className="text-xl font-black text-gray-800 tracking-tight">AI Photobooth</span>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500">Transform your photo with AI magic ✨</p>
      </header>

      <div className="mx-auto max-w-md px-4 pb-10">

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {(["capture", "theme", "processing"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                s === step ? "bg-pink-500 text-white shadow-md shadow-pink-200" :
                (step === "theme" && s === "capture") || step === "processing" ? "bg-cyan-400 text-white" :
                "bg-gray-200 text-gray-400"
              }`}>{i + 1}</div>
              {i < 2 && <div className={`h-0.5 w-8 rounded-full ${
                (step === "theme" && i === 0) || step === "processing" ? "bg-cyan-400" : "bg-gray-200"
              }`} />}
            </div>
          ))}
        </div>

        {/* Step: Capture */}
        {step === "capture" && (
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-pink-100 border border-pink-50">
            <h2 className="mb-1 text-lg font-black text-gray-800">Ambil Foto</h2>
            <p className="mb-5 text-sm text-gray-400">Pakai kamera atau upload dari galeri</p>
            <CameraCapture onCapture={handleFile} />
            <div className="my-4 flex items-center gap-3">
              <hr className="flex-1 border-gray-100" />
              <span className="text-xs font-semibold text-gray-300">ATAU</span>
              <hr className="flex-1 border-gray-100" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 py-6 text-sm font-semibold text-pink-400 transition hover:border-pink-400 hover:bg-pink-100 hover:text-pink-500">
              <span className="block text-2xl mb-1">🖼️</span>
              Upload dari Galeri
            </button>
          </div>
        )}

        {/* Step: Theme */}
        {step === "theme" && preview && (
          <div className="space-y-4">
            {/* Preview card */}
            <div className="rounded-3xl bg-white p-4 shadow-lg shadow-pink-100 border border-pink-50">
              <div className="relative overflow-hidden rounded-2xl">
                <Image src={preview} alt="Preview" width={400} height={400}
                  className="w-full object-cover aspect-square" style={{ width: "100%", height: "auto" }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
                  <p className="text-xs font-semibold text-white">Foto kamu</p>
                </div>
              </div>
            </div>

            {/* Theme picker */}
            <div className="rounded-3xl bg-white p-5 shadow-lg shadow-pink-100 border border-pink-50">
              <h2 className="mb-1 text-lg font-black text-gray-800">Pilih Tema</h2>
              <p className="mb-4 text-sm text-gray-400">Mau jadi apa foto kamu?</p>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <ThemeCard key={t.id} theme={t} selected={selectedTheme === t.id}
                    onClick={() => setSelectedTheme(t.id)} />
                ))}
              </div>
              {error && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-500">{error}</div>
              )}
              <div className="mt-4 flex gap-3">
                <button onClick={() => { setStep("capture"); setPreview(null); setFile(null); setSelectedTheme(null); }}
                  className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-3 text-sm font-bold text-gray-400 hover:bg-gray-100 transition">
                  Ulang
                </button>
                <button onClick={handleProcess} disabled={!selectedTheme}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-sm font-black text-white shadow-md shadow-pink-200 transition hover:opacity-90 disabled:opacity-40 disabled:shadow-none">
                  ✨ Transformasi!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="rounded-3xl bg-white p-10 shadow-lg shadow-pink-100 border border-pink-50 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-cyan-100">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
            </div>
            <h2 className="text-lg font-black text-gray-800">AI sedang bekerja...</h2>
            <p className="mt-2 text-sm text-gray-400">Biasanya 5-15 detik, mohon tunggu</p>
            <div className="mt-5 flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="h-2 w-2 rounded-full bg-pink-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
