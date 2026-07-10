"use client";

import { useState, useEffect } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { ThemeCard } from "@/components/ThemeCard";
import { useRouter } from "next/navigation";

type Theme = { id: string; label: string; emoji: string; prompt: string; previewUrl: string; previewImages: string; active: boolean };
type Step = "theme" | "capture" | "processing";

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("theme");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/themes").then(r => r.ok ? r.json() : []).then((data: Theme[]) => setThemes(data.filter(t => t.active)));
  }, []);

  async function handleFile(f: File) {
    if (!selectedTheme) return;
    setStep("processing");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", f);
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
      setStep("capture");
    }
  }

  const STEP_LABELS: Record<Step, string> = { theme: "Pilih Tema", capture: "Ambil Foto", processing: "Proses" };
  const STEPS: Step[] = ["theme", "capture", "processing"];

  // ponytail: map themes from DB to ThemeCard shape
  const themeCards = themes.map(t => ({
    id: t.id, label: t.label, emoji: t.emoji,
    previewUrl: t.previewUrl,
    previewImages: (() => { try { return JSON.parse(t.previewImages); } catch { return []; } })() as string[],
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-5 py-2 shadow-sm border border-pink-100 dark:border-slate-700">
          <span className="text-2xl">📸</span>
          <span className="text-xl font-black text-gray-800 dark:text-slate-100 tracking-tight">AI Photobooth</span>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-slate-400">Transform your photo with AI magic ✨</p>
      </header>

      <div className="mx-auto max-w-md px-4 pb-10">
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all
                ${step === s ? "bg-pink-500 text-white shadow-md shadow-pink-200 dark:shadow-pink-900/30" :
                  STEPS.indexOf(step) > i ? "bg-green-400 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"}`}>
                {STEPS.indexOf(step) > i ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-semibold ${step === s ? "text-pink-500" : "text-gray-400 dark:text-slate-500"}`}>{STEP_LABELS[s]}</span>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200 dark:bg-slate-700" />}
            </div>
          ))}
        </div>

        {step === "theme" && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700">
            <h2 className="mb-1 text-lg font-black text-gray-800 dark:text-slate-100">Pilih Tema</h2>
            <p className="mb-5 text-sm text-gray-400 dark:text-slate-400">Klik tema untuk lihat preview & pilih</p>
            {themeCards.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Memuat tema...</p>}
            <div className="grid grid-cols-3 gap-3">
              {themeCards.map((t) => (
                <ThemeCard key={t.id} theme={t} selected={selectedTheme === t.id} onSelect={() => setSelectedTheme(t.id)} />
              ))}
            </div>
            <button disabled={!selectedTheme} onClick={() => setStep("capture")}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Lanjut Ambil Foto →
            </button>
          </div>
        )}

        {step === "capture" && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700">
            {selectedTheme && (() => {
              const t = themeCards.find(t => t.id === selectedTheme)!;
              return (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-pink-50 dark:bg-slate-900 px-3 py-2 border border-pink-100 dark:border-slate-700">
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-xs font-bold text-pink-500">Tema: {t.label}</span>
                  <button onClick={() => setStep("theme")} className="ml-auto text-[10px] text-gray-400 dark:text-slate-500 hover:text-pink-400 dark:hover:text-pink-400 font-semibold underline">Ganti</button>
                </div>
              );
            })()}
            <h2 className="mb-1 text-lg font-black text-gray-800 dark:text-slate-100">Ambil Foto</h2>
            <p className="mb-5 text-sm text-gray-400 dark:text-slate-400">Foto wajah kamu dengan jelas</p>
            <CameraCapture onCapture={handleFile} />
            {error && <p className="mt-3 text-center text-xs font-medium text-red-400">{error}</p>}
          </div>
        )}

        {step === "processing" && (
          <div className="rounded-3xl bg-white dark:bg-slate-800 p-10 shadow-lg shadow-pink-100 dark:shadow-none border border-pink-50 dark:border-slate-700 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-cyan-100 dark:from-slate-700 dark:to-slate-700">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
            </div>
            <h2 className="text-lg font-black text-gray-800 dark:text-slate-100">AI sedang bekerja...</h2>
            <p className="mt-2 text-sm text-gray-400 dark:text-slate-400">Biasanya 15-30 detik, mohon tunggu</p>
            <div className="mt-5 flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="h-2 w-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}