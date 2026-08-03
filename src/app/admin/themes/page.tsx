"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theme = { id: string; label: string; emoji: string; prompt: string; previewUrl: string; previewImages: string; active: boolean; sortOrder: number };
type KieModel = { id: string; label: string };

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Theme>>({});
  const router = useRouter();

  const [models, setModels] = useState<KieModel[]>([]);
  const [newModelId, setNewModelId] = useState("");
  const [newModelLabel, setNewModelLabel] = useState("");
  const [testerThemeId, setTesterThemeId] = useState<string>("");
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [testModel, setTestModel] = useState<string>("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testCredits, setTestCredits] = useState<number | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [modelModal, setModelModal] = useState(false);

  const [userModel, setUserModel] = useState<string>("");
  const [userModelSel, setUserModelSel] = useState<string>("");
  const [savingModel, setSavingModel] = useState(false);

  useEffect(() => {
    fetch("/api/admin/themes", { cache: "no-store" }).then(r => r.ok ? r.json() : []).then(setThemes);
    fetch("/api/admin/credits").then(r => r.ok ? r.json() : null).then(j => { if (j) setCredits(j.credits); });
    fetch("/api/admin/kie-models").then(r => r.ok ? r.json() : []).then((list: KieModel[]) => {
      setModels(list);
      if (!testModel && list.length) setTestModel(list[0].id);
    });
    fetch("/api/admin/settings").then(r => r.ok ? r.json() : null).then((j: any) => {
      if (j) { setUserModel(j.userModel ?? ""); setUserModelSel(j.userModel ?? ""); }
    });
  }, []);

  async function saveUserModel() {
    if (!userModelSel) return;
    setSavingModel(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userModel: userModelSel }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setUserModel(userModelSel);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSavingModel(false);
    }
  }

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
      fd.append("themeId", testerThemeId);
      const res = await fetch("/api/admin/preview-test", { method: "POST", body: fd });
      const jt = await res.text();
      let j: any;
      try { j = JSON.parse(jt); } catch { throw new Error("Respons tidak valid dari server (cek API key kie.ai)"); }
      if (!res.ok) throw new Error(j?.error ?? "Test gagal");
      await pollTest(j.taskId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Test gagal");
    } finally {
      setTestLoading(false);
    }
  }

  async function pollTest(taskId: string) {
    for (let i = 0; i < 80; i++) {
      const r = await fetch(`/api/admin/preview-test?taskId=${taskId}`);
      const s = await r.json();
      if (s.status === "done") { setTestResult(s.imageUrl); setTestCredits(s.credits); setTestModalOpen(true); return; }
      if (s.status === "failed") throw new Error("Test gagal diproses kie.ai");
      await new Promise(res => setTimeout(res, 2500));
    }
    throw new Error("Test timeout (callback kie.ai tidak memanggil)");
  }

  async function savePreview() {
    if (!testerThemeId || !testResult) return;
    const theme = themes.find(t => t.id === testerThemeId);
    if (!theme) { alert("Tema tidak ditemukan"); return; }
    let imgs: string[] = [];
    try { const parsed = JSON.parse(theme.previewImages); if (Array.isArray(parsed)) imgs = parsed; } catch { /* ignore */ }
    if (!imgs.includes(testResult)) imgs.push(testResult);
    const res = await fetch(`/api/admin/themes/${testerThemeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previewUrl: testResult, previewImages: JSON.stringify(imgs) }),
    });
    if (!res.ok) { alert("Gagal menyimpan preview"); return; }
    setThemes(await fetch("/api/admin/themes").then(r => r.json()));
    alert("Preview tema diperbarui");
  }
  function startNew() { setEditing("new"); setForm({ active: true, sortOrder: themes.length, emoji: "🎨" }); }

  async function errText(res: Response): Promise<string> {
    const text = await res.text();
    try { const j = JSON.parse(text); return j.error ?? text; } catch { return text || `HTTP ${res.status}`; }
  }

  async function save() {
    try {
      if (editing === "new") {
        const res = await fetch("/api/admin/themes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) throw new Error(await errText(res));
      } else {
        const res = await fetch(`/api/admin/themes/${editing}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (!res.ok) throw new Error(await errText(res));
      }
      setEditing(null);
      const r = await fetch("/api/admin/themes", { cache: "no-store" });
      setThemes(await r.json());
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal simpan");
    }
  }

  async function del(id: string) {
    if (!confirm("Hapus tema?")) return;
    await fetch(`/api/admin/themes/${id}`, { method: "DELETE" });
    setThemes(await fetch("/api/admin/themes", { cache: "no-store" }).then(r => r.json()));
  }

  async function addModel() {
    if (!newModelId || !newModelLabel) return;
    const res = await fetch("/api/admin/kie-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newModelId, label: newModelLabel }),
    });
    if (!res.ok) { alert("Gagal tambah model (id mungkin duplikat)"); return; }
    setModels(await fetch("/api/admin/kie-models").then(r => r.json()));
    setNewModelId(""); setNewModelLabel("");
  }

  async function removeModel(id: string) {
    await fetch(`/api/admin/kie-models/${id}`, { method: "DELETE" });
    setModels(await fetch("/api/admin/kie-models").then(r => r.json()));
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-700">{t.label}</p>
              <p className="text-xs text-gray-400 truncate">{t.prompt}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.active ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>{t.active ? "Aktif" : "Nonaktif"}</span>
            <button onClick={() => startEdit(t)} className="text-xs font-semibold text-blue-500 hover:text-blue-600">Edit</button>
            <button onClick={() => del(t.id)} className="text-xs font-semibold text-red-400 hover:text-red-500">Hapus</button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-gray-800">Model Proses User</h2>
          {userModel && userModel !== userModelSel && <span className="text-[11px] font-semibold text-amber-500">Belum disimpan</span>}
        </div>
        <p className="text-xs text-gray-400">Model ini dipakai saat user memproses foto. Atur dynamically, tidak di-hardcode.</p>
        <div className="flex gap-2">
          <select value={userModelSel} onChange={e => setUserModelSel(e.target.value)} className="flex-1 rounded-2xl border-2 border-gray-100 px-4 py-2 text-sm outline-none focus:border-pink-300">
            {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <button onClick={saveUserModel} disabled={!userModelSel || savingModel || userModel === userModelSel}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-2 text-xs font-black text-white hover:opacity-90 transition disabled:opacity-40">
            {savingModel ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
        {userModel && (
          <p className="text-xs text-gray-400">Aktif sekarang: <span className="font-bold text-gray-600">{models.find(m => m.id === userModel)?.label ?? userModel}</span></p>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-800">Preview & Tester</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-pink-50 text-pink-600">Saldo Kredit: {credits ?? "?"}</span>
              <button onClick={() => setModelModal(true)} className="text-xs font-semibold px-2 py-1 rounded-full border border-pink-200 text-pink-600 hover:bg-pink-50 transition">Kelola Model</button>
            </div>
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
              {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
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
        {testResult && testModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setTestModalOpen(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-gray-800">Hasil Test</h2>
                <button onClick={() => setTestModalOpen(false)} className="text-xs font-bold text-gray-400 hover:text-pink-500">Tutup</button>
              </div>
              <img src={testResult} alt="preview" className="w-full rounded-2xl border border-gray-100" />
              <p className="text-xs font-semibold text-gray-500">Kredit terpakai: {testCredits ?? "?"}</p>
              <button onClick={savePreview} disabled={!testerThemeId}
                className="w-full rounded-2xl border-2 border-pink-200 py-2.5 text-xs font-black text-pink-600 hover:bg-pink-50 transition disabled:opacity-40">
                Jadikan preview tema
              </button>
            </div>
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
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} /><span className="text-xs font-semibold text-gray-600">Aktif</span></label>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-2xl border-2 border-gray-100 py-2 text-xs font-bold text-gray-400 hover:bg-gray-50">Batal</button>
              <button onClick={save} className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 py-2 text-xs font-black text-white hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {modelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setModelModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-black text-gray-800">Kelola Model</h2>
            <div className="flex gap-2">
              <input placeholder="Model id (mis. flux-2/flex-image-to-image)" value={newModelId} onChange={e => setNewModelId(e.target.value)} className="flex-1 rounded-xl border-2 border-gray-100 px-3 py-2 text-xs outline-none focus:border-pink-300" />
              <input placeholder="Label" value={newModelLabel} onChange={e => setNewModelLabel(e.target.value)} className="w-32 rounded-xl border-2 border-gray-100 px-3 py-2 text-xs outline-none focus:border-pink-300" />
              <button onClick={addModel} className="rounded-xl bg-pink-500 px-3 py-2 text-xs font-black text-white hover:opacity-90 transition">+ Model</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {models.map(m => (
                <span key={m.id} className="inline-flex items-center gap-1 text-xs bg-white border border-gray-100 rounded-full px-2 py-1">
                  {m.label}
                  <button onClick={() => removeModel(m.id)} className="text-red-400 font-bold leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModelModal(false)} className="flex-1 rounded-2xl border-2 border-gray-100 py-2 text-xs font-bold text-gray-400 hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}