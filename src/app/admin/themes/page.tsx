"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theme = { id: string; label: string; emoji: string; prompt: string; previewUrl: string; previewImages: string; active: boolean; sortOrder: number };

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Theme>>({});
  const router = useRouter();

  useEffect(() => { fetch("/api/admin/themes").then(r => r.json()).then(setThemes); }, []);

  function startEdit(t: Theme) { setEditing(t.id); setForm(t); }
  function startNew() { setEditing("new"); setForm({ active: true, sortOrder: themes.length, emoji: "🎨" }); }

  async function save() {
    if (editing === "new") {
      await fetch("/api/admin/themes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/admin/themes/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setEditing(null);
    const r = await fetch("/api/admin/themes");
    setThemes(await r.json());
  }

  async function del(id: string) {
    if (!confirm("Hapus tema?")) return;
    await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
    setThemes(await fetch("/api/admin/themes").then(r => r.json()));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">Tema</h1>
        <button onClick={startNew} className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-2 text-xs font-black text-white hover:opacity-90 transition">+ Tambah</button>
      </div>

      <div className="space-y-3">
        {themes.map(t => (
          <div key={t.id} className="rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-4">
            <span className="text-2xl">{t.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-black text-gray-700">{t.label}</p>
              <p className="text-xs text-gray-400 truncate">{t.prompt}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>{t.active ? "Aktif" : "Nonaktif"}</span>
            <button onClick={() => startEdit(t)} className="text-xs font-semibold text-blue-500 hover:text-blue-600">Edit</button>
            <button onClick={() => del(t.id)} className="text-xs font-semibold text-red-400 hover:text-red-500">Hapus</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-black text-gray-800">{editing === "new" ? "Tambah Tema" : "Edit Tema"}</h2>
            <input placeholder="ID (lowercase)" value={form.id ?? ""} onChange={e => setForm({ ...form, id: e.target.value })} disabled={editing !== "new"} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300" />
            <input placeholder="Label" value={form.label ?? ""} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300" />
            <input placeholder="Emoji" value={form.emoji ?? ""} onChange={e => setForm({ ...form, emoji: e.target.value })} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300" />
            <textarea placeholder="Prompt" value={form.prompt ?? ""} onChange={e => setForm({ ...form, prompt: e.target.value })} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300 h-20" />
            <input placeholder="Preview URL" value={form.previewUrl ?? ""} onChange={e => setForm({ ...form, previewUrl: e.target.value })} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} /><span className="text-xs font-semibold text-gray-600">Aktif</span></label>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-2xl border-2 border-gray-100 py-2 text-xs font-bold text-gray-400 hover:bg-gray-50">Batal</button>
              <button onClick={save} className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-2 text-xs font-black text-white hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}