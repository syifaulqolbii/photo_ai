const KIE = "https://api.kie.ai/api/v1/jobs";
const kieHeaders = () => ({ Authorization: `Bearer ${process.env.KIE_API_KEY}`, "Content-Type": "application/json" });

export { KIE, kieHeaders };

type PollData = { state?: string; resultJson?: string; creditsConsumed?: number };

async function pollTask(taskId: string, maxMs = 120_000): Promise<{ url: string; credits: number | null }> {
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
      if (url) return { url, credits: d.creditsConsumed ?? null };
    }
  }
  throw new Error("kie.ai task timed out");
}

export { pollTask };
