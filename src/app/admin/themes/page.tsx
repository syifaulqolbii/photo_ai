"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theme = { id: string; label: string; emoji: string; prompt: string; previewUrl: string; previewImages: string; active: boolean; sortOrder: number };

import { getKieModels } from "@/lib/kie-models";
const MODELS = getKieModels();

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Theme>>({});
  const router = useRouter();

  const [testerThemeId, setTesterThemeId] = useState<string>("");
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [testModel, setTestModel] = useState<string>(MODELS[0].id);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testCredits, setTestCredits] = useState<number | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/themes").then(r => r.json()).then(setThemes);
    fetch("/api/admin/credits").then(r => r.ok ? r.json() : null).then(j => { if (j) setCredits(j.credits); });
  }, []);

  function startEdit(t: Theme) { setEditing(t.id); setForm(t); }

  function onTesterTheme(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setTesterThemeId(id);
    const t = themes.find(x => x.id === id);
    setTestPrompt(t?.prompt ?? "");
  }

  async function runTest() {
    if (!testerThemeId || !testFile) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const fd = new FormData();
      fd.append("file", testFile);
      fd.append("prompt", testPrompt);
      fd.append("model", testModel);
      const res = await fetch("/api/admin/themes/test", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Test gagal");
      setTestResult(j.imageUrl);
      setTestCredits(j.credits);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Test gagal");
    } finally {
      setTestLoading(false);
    }
  }

  async function savePreview() {
    if (!testerThemeId || !testResult) return;
    const res = await fetch(`/api/admin/themes/${testerThemeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previewUrl: testResult }),
    });
    if (!res.ok) { alert("Gagal menyimpan preview"); return; }
    setThemes(await fetch("/api/admin/themes").then(r => r.json()));
    alert("Preview tema diperbarui");
  }
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

      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-800">Preview & Tester</h2>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-pink-50 text-pink-600">Saldo Kredit: {credits ?? "?"}</span>
          </div>
          <p className="text-xs text-gray-400">Upload foto tes, atur prompt & model, lalu simpan jadi preview tema.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">Tema</label>
            <select value={testerThemeId} onChange={onTesterTheme} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300">
              <option value="">Pilih tema...</option>
              {themes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">Model</label>
            <select value={testModel} onChange={e => setTestModel(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300">
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500">Prompt</label>
          <textarea value={testPrompt} onChange={e => setTestPrompt(e.target.value)} className="w-full rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300 h-20" placeholder="Prompt AI..." />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-500">Foto Tes</label>
          <input type="file" accept="image/*" onChange={e => setTestFile(e.target.files?.[0] ?? null)} className="w-full text-sm text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-pink-600" />
        </div>
        <button onClick={runTest} disabled={!testerThemeId || !testFile || testLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-3 text-sm font-black text-white shadow-md shadow-pink-200 hover:opacity-90 transition disabled:opacity-40">
          {testLoading ? "Memproses..." : "Test"}
        </button>
        {testResult && (
          <div className="space-y-3">
            <img src={testResult} alt="preview" className="w-full rounded-2xl border border-gray-100" />
            <p className="text-xs font-semibold text-gray-500">Kredit terpakai: {testCredits ?? "?"}</p>
            <button onClick={savePreview} disabled={!testerThemeId}
              className="w-full rounded-2xl border-2 border-pink-200 py-2.5 text-xs font-black text-pink-600 hover:bg-pink-50 transition disabled:opacity-40">
              Jadikan preview tema
            </button>
          </div>
        )}
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