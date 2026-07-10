"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Props = { onCapture: (file: File) => void };

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
    } catch {
      setError("Kamera tidak dapat diakses. Gunakan upload manual.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], "capture.jpg", { type: "image/jpeg" }));
      stopCamera();
    }, "image/jpeg");
  }, [onCapture, stopCamera]);

  if (error) return <p className="text-sm font-medium text-red-400 text-center">{error}</p>;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {stream ? (
        <>
          <div className="relative w-full overflow-hidden rounded-2xl border-2 border-pink-200 dark:border-pink-900/50 bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-inset ring-pink-300/30" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex w-full gap-3">
            <button onClick={stopCamera}
              className="rounded-2xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-gray-400 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              Batal
            </button>
            <button onClick={capture}
              className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-2 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition">
              📸 Ambil Foto
            </button>
          </div>
        </>
      ) : (
        <button onClick={startCamera}
          className="w-full rounded-2xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/30 py-6 text-sm font-semibold text-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-800 transition">
          <span className="block text-2xl mb-1">📷</span>
          Buka Kamera
        </button>
      )}
    </div>
  );
}
