"use client";
import { useEffect, useState } from "react";

type ThemeStat = { theme: string; count: number };
type Stats = { total: number; done: number; byTheme: ThemeStat[]; recent: { id: string; theme: string; status: string; createdAt: string }[]; page: number; totalPages: number };

const COLORS = ["#f472b6","#fb923c","#a78bfa","#34d399","#60a5fa","#fbbf24","#f87171"];

function PieChart({ data }: { data: ThemeStat[] }) {
  const total = data.reduce((s, d) => s + Number(d.count), 0);
  if (!total) return <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-6">Belum ada data.</p>;
  let cumAngle = 0;
  const cx = 80, cy = 80, r = 70;
  const slices = data.map((d, i) => {
    const pct = Number(d.count) / total;
    const angle = pct * 360;
    const start = cumAngle;
    cumAngle += angle;
    const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(start + angle));
    const y2 = cy + r * Math.sin(toRad(start + angle));
    const large = angle > 180 ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], label: d.theme, count: d.count, pct: Math.round(pct * 100) };
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={38} className="fill-white dark:fill-slate-900" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="bold" className="fill-gray-800 dark:fill-slate-100">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" className="fill-gray-400 dark:fill-slate-500">foto</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="capitalize flex-1 text-gray-600 dark:text-slate-400">{s.label.replace("_", " ")}</span>
            <span className="font-black text-gray-700 dark:text-slate-200">{s.count}</span>
            <span className="text-gray-400 dark:text-slate-500 w-8 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setStats(null);
    fetch(`/api/admin/stats?page=${page}`).then(r => r.json()).then(setStats);
  }, [page]);

  if (!stats) return <div className="text-sm text-gray-400 text-center py-20">Memuat...</div>;
  const failed = stats.total - stats.done;
  const rate = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const maxCount = Math.max(...stats.byTheme.map(t => Number(t.count)), 1);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-black text-gray-800 dark:text-slate-100">Dashboard</h1>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-gray-800 dark:text-slate-200" },
          { label: "Berhasil", value: stats.done, color: "text-green-600 dark:text-green-400" },
          { label: "Gagal", value: failed, color: "text-red-500 dark:text-red-400" },
          { label: "Success Rate", value: `${rate}%`, color: rate >= 80 ? "text-green-600 dark:text-green-400" : "text-yellow-500 dark:text-yellow-400" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5">
          <h2 className="mb-4 text-sm font-black text-gray-700 dark:text-slate-200">Distribusi Tema</h2>
          <PieChart data={stats.byTheme} />
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5">
          <h2 className="mb-4 text-sm font-black text-gray-700 dark:text-slate-200">Foto per Tema</h2>
          {stats.byTheme.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">Belum ada data.</p>}
          <div className="space-y-3">
            {stats.byTheme.map((t, i) => (
              <div key={t.theme} className="flex items-center gap-2">
                <span className="w-20 text-xs text-gray-500 dark:text-slate-400 capitalize truncate">{t.theme.replace("_", " ")}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${Math.round(Number(t.count) / maxCount * 100)}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-xs font-black text-gray-600 dark:text-slate-300 w-6 text-right">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-gray-700 dark:text-slate-200">Aktivitas Terbaru</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">Hal {stats.page} / {stats.totalPages}</span>
        </div>
        {stats.recent.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">Belum ada foto.</p>}
        <div className="space-y-2">
          {stats.recent.map(p => (
            <div key={p.id} className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "done" ? "bg-green-400" : p.status === "failed" ? "bg-red-400" : "bg-yellow-400"}`} />
              <span className="flex-1 capitalize">{p.theme.replace("_", " ")}</span>
              <span className={`font-semibold ${p.status === "done" ? "text-green-500 dark:text-green-400" : p.status === "failed" ? "text-red-400" : "text-yellow-500 dark:text-yellow-400"}`}>{p.status}</span>
              <span className="text-gray-300 dark:text-slate-500">{new Date(p.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
          ))}
        </div>
        {stats.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-30 transition">← Sebelumnya</button>
            <span className="text-xs text-gray-400 dark:text-slate-500">{page} / {stats.totalPages}</span>
            <button disabled={page >= stats.totalPages} onClick={() => setPage(p => p + 1)}
              className="text-xs font-semibold text-gray-400 dark:text-slate-500 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-30 transition">Berikutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}