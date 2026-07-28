const KIE = "https://api.kie.ai/api/v1/jobs";
const kieHeaders = () => ({ Authorization: `Bearer ${process.env.KIE_API_KEY}`, "Content-Type": "application/json" });

export { KIE, kieHeaders };

type PollData = { state?: string; resultJson?: string };

async function pollTask(taskId: string, maxMs = 120_000): Promise<string> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    const res = await fetch(`${KIE}/recordInfo?taskId=${taskId}`, { headers: kieHeaders() });
    const j = await res.json() as { code: number; data?: PollData };
    const d = j.data;
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
    const res = await fetch("https://api.kie.ai/api/v1/chat/credit", { headers: kieHeaders() });
    const j = await res.json() as { code: number; data?: number };
    if (j.code !== 200 || j.data == null) return null;
    return j.data;
  } catch {
    return null;
  }
}
