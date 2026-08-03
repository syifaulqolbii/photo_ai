"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Props = { onCapture: (file: File) => void };

const STORAGE_KEY = "selectedCameraId";

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<3 | 5>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const startCamera = useCallback(async (deviceId?: string) => {
    setError(null);
    try {
      const videoConstraints = {
        ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }),
        aspectRatio: { ideal: 16 / 9 },
      };
      const constraints: MediaStreamConstraints = { video: videoConstraints };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      const active = s.getVideoTracks()[0]?.getSettings().deviceId ?? "";
      if (active) setSelectedId(active);
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === "videoinput"));
    } catch {
      // ponytail: kalau deviceId tersimpan sudah lepas (exact gagal), fallback ke kamera default
      if (deviceId) return startCamera();
      setError("Kamera tidak dapat diakses. Gunakan upload manual.");
    }
  }, []);

  const switchCamera = useCallback(async (id: string) => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    localStorage.setItem(STORAGE_KEY, id);
    await startCamera(id);
  }, [stream, startCamera]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setVideoAspectRatio(null);
    setCountdown(null);
  }, [stream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (!video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setCapturedFile(file);
      setCapturedPreview(URL.createObjectURL(file));
      stopCamera();
    }, "image/jpeg");
  }, [stopCamera]);

  useEffect(() => {
    if (countdown === null) return;
    const timeout = window.setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);
        capture();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [countdown, capture]);

  useEffect(() => {
    return () => {
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    };
  }, [capturedPreview]);

  const retake = useCallback(async () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedFile(null);
    setCapturedPreview(null);
    await startCamera(selectedId || undefined);
  }, [capturedPreview, selectedId, startCamera]);

  const confirmCapture = useCallback(() => {
    if (!capturedFile) return;
    onCapture(capturedFile);
  }, [capturedFile, onCapture]);

  if (error) return <p className="text-sm font-medium text-red-400 text-center">{error}</p>;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {capturedPreview ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full overflow-hidden rounded-2xl border-2 border-pink-200 dark:border-pink-900/50 bg-black">
            <img src={capturedPreview} alt="Preview foto yang diambil" className="block max-h-[70vh] w-full object-contain" />
          </div>
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-slate-400">
            Apakah pose dan gaya fotonya sudah cocok?
          </p>
          <div className="flex w-full gap-3">
            <button onClick={retake}
              className="flex-1 rounded-2xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              Ulangi Foto
            </button>
            <button onClick={confirmCapture}
              className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition">
              Proses dengan AI
            </button>
          </div>
        </div>
      ) : stream ? (
        <>
          <div
            className="relative w-full overflow-hidden rounded-2xl border-2 border-pink-200 dark:border-pink-900/50 bg-black"
            style={{ aspectRatio: videoAspectRatio ?? "16 / 9" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                if (video.videoWidth && video.videoHeight) {
                  setVideoAspectRatio(video.videoWidth / video.videoHeight);
                }
              }}
              className="absolute inset-0 h-full w-full object-contain"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span key={countdown} className="animate-ping-once text-8xl font-black text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
                  {countdown}
                </span>
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-2 ring-inset ring-pink-300/30" />
          </div>
          {devices.length > 1 && (
            <select
              value={selectedId}
              onChange={(e) => switchCamera(e.target.value)}
              disabled={countdown !== null}
              className="w-full rounded-2xl border-2 border-gray-100 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-pink-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Kamera ${i + 1}`}
                </option>
              ))}
            </select>
          )}
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex w-full gap-3">
            <button onClick={stopCamera} disabled={countdown !== null}
              className="rounded-2xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-gray-400 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              Batal
            </button>
            <button onClick={() => setCountdown(timerSeconds)} disabled={countdown !== null}
              className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-2 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-70">
              {countdown !== null ? `Siap-siap... ${countdown}` : `📸 Foto dalam ${timerSeconds} detik`}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-400">
            <span>Timer:</span>
            {[3, 5].map((seconds) => (
              <button key={seconds} type="button" disabled={countdown !== null}
                onClick={() => setTimerSeconds(seconds as 3 | 5)}
                className={`rounded-full px-3 py-1 font-bold transition ${timerSeconds === seconds
                  ? "bg-pink-100 text-pink-500 dark:bg-pink-900/40 dark:text-pink-300"
                  : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-300"}`}>
                {seconds}s
              </button>
            ))}
          </div>
        </>
      ) : (
        <button onClick={() => startCamera(localStorage.getItem(STORAGE_KEY) || undefined)}
          className="w-full rounded-2xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50 dark:bg-cyan-950/30 py-6 text-sm font-semibold text-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-800 transition">
          <span className="block text-2xl mb-1">📷</span>
          Buka Kamera
        </button>
      )}
    </div>
  );
}
