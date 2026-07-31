const KIE = "https://api.kie.ai/api/v1/jobs";
const kieHeaders = () => ({ Authorization: `Bearer ${process.env.KIE_API_KEY}`, "Content-Type": "application/json" });

export { KIE, kieHeaders };

type PollData = { state?: string; resultJson?: string };

async function safeJson(res: Response): Promise<{ ok: boolean; json: any; text: string }> {
  const text = await res.text();
  try { return { ok: true, json: JSON.parse(text), text }; }
  catch { return { ok: false, json: null, text }; }
}

async function pollTask(taskId: string, maxMs = 120_000): Promise<string> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    const r = await safeJson(await fetch(`${KIE}/recordInfo?taskId=${taskId}`, { headers: kieHeaders() }));
    if (!r.ok) throw new Error("kie.ai respons non-JSON: " + r.text.slice(0, 200));
    const d = r.json?.data;
    if (!d) continue;
    if (d.state === "fail") throw new Error("kie.ai task failed");
    if (d.state === "success" && d.resultJson) {
      const result = JSON.parse(d.resultJson) as { resultUrls?: string[] };
      const url = result.resultUrls?.[0];
      if (url) return url;
    }
  }
  throw new Error("kie.ai task timed out");
}

export { pollTask };

// ponytail: kie.ai tidak mengembalikan credit per-task di recordInfo; ambil saldo riil via endpoint /chat/credit
export async function fetchCreditBalance(): Promise<number | null> {
  try {
    const r = await safeJson(await fetch("https://api.kie.ai/api/v1/chat/credit", { headers: kieHeaders() }));
    if (!r.ok || r.json?.code !== 200 || r.json?.data == null) return null;
    return r.json.data as number;
  } catch {
    return null;
  }
}
