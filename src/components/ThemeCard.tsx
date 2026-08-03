"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Theme = { id: string; label: string; emoji: string; previewUrl: string; previewImages: readonly string[] };

export function ThemeCard({ theme, selected, onSelect }: {
  theme: Theme; selected: boolean; onSelect: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const imgs = theme.previewImages.length ? theme.previewImages : (theme.previewUrl ? [theme.previewUrl] : []);
  const total = imgs.length;

  function open() { setIdx(0); setModalOpen(true); }
  function close() { setModalOpen(false); }
  function prev() { setIdx((i) => (i - 1 + total) % total); }
  function next() { setIdx((i) => (i + 1) % total); }

  return (
    <>
      {/* Card */}
      <div
        onClick={open}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all",
          selected ? "border-pink-400 shadow-lg shadow-pink-100 dark:shadow-none scale-105" : "border-gray-100 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-400/50"
        )}
      >
        <div className="relative w-full aspect-square">
          <Image src={theme.previewUrl} alt={theme.label} fill className="object-cover" sizes="160px" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">👁</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 pb-2 flex flex-col items-center">
            <span className="text-lg">{theme.emoji}</span>
            <span className="text-xs font-black text-white drop-shadow">{theme.label}</span>
          </div>
          {selected && (
            <div className="absolute top-2 right-2 bg-pink-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black text-white shadow">✓</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-5"
          onClick={close}
        >
          <div
            className="w-[92vw] max-w-md sm:max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar — white */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl">{theme.emoji}</span>
                <span className="text-sm sm:text-base lg:text-lg font-black text-gray-800 dark:text-slate-100">{theme.label}</span>
                <span className="text-xs sm:text-sm text-gray-400 dark:text-slate-500">{idx + 1}/{total}</span>
              </div>
              <button onClick={close} className="text-gray-300 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-xl sm:text-2xl leading-none">×</button>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-square bg-gray-50 dark:bg-slate-900">
               <Image
                 src={imgs[idx]}
                 alt={`${theme.label} ${idx + 1}`}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 576px, (min-width: 640px) 512px, 92vw"
                priority
              />
              <button onClick={prev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition text-base sm:text-xl shadow">
                ‹
              </button>
              <button onClick={next}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition text-base sm:text-xl shadow">
                ›
              </button>
              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center gap-1.5 sm:gap-2">
                {imgs.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all", i === idx ? "bg-pink-500" : "bg-gray-300")} />
                ))}
              </div>
            </div>

            {/* Footer — white */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 bg-white dark:bg-slate-800">
              <button
                onClick={() => { onSelect(); close(); }}
                className={cn(
                  "w-full rounded-2xl py-3 sm:py-3.5 text-sm sm:text-base font-black transition",
                  selected
                    ? "bg-pink-500 text-white"
                    : "bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:opacity-90"
                )}
              >
                {selected ? "✓ Tema Dipilih" : `Pilih Tema ${theme.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
