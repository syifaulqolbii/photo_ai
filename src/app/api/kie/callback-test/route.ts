import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { kieTestResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET } from "@/lib/supabase";
import { fetchCreditBalance } from "@/lib/kie";

type CallbackData = { taskId?: string; state?: string; resultJson?: string; failMsg?: string };

export async function POST(req: NextRequest) {
  let body: { data?: CallbackData } | null = null;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: true }); }
  const data = body?.data;
  if (!data?.taskId) return NextResponse.json({ ok: true });

  const [row] = await db.select().from(kieTestResults).where(eq(kieTestResults.taskId, data.taskId));
  if (!row) return NextResponse.json({ ok: true });

  if (data.state === "success" && data.resultJson) {
    try {
      const result = JSON.parse(data.resultJson) as { resultUrls?: string[] };
      const url = result.resultUrls?.[0];
      if (!url) throw new Error("resultUrls kosong");
      const imgRes = await fetch(url);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const outPath = `tester-results/${crypto.randomUUID()}.jpg`;
      await supabase.storage.from(BUCKET).upload(outPath, buf, { contentType: "image/jpeg", upsert: true });
      const outUrl = supabase.storage.from(BUCKET).getPublicUrl(outPath).data.publicUrl;
      const after = await fetchCreditBalance();
      const credits = row.beforeBalance != null && after != null ? row.beforeBalance - after : null;
      await db.update(kieTestResults).set({ status: "done", imageUrl: outUrl, credits }).where(eq(kieTestResults.taskId, data.taskId));
    } catch (e) {
      console.error("[callback-test] process result gagal:", e);
      await db.update(kieTestResults).set({ status: "failed" }).where(eq(kieTestResults.taskId, data.taskId));
    }
  } else if (data.state === "fail") {
    console.error("[callback-test] task fail:", data.failMsg);
    await db.update(kieTestResults).set({ status: "failed" }).where(eq(kieTestResults.taskId, data.taskId));
  }

  return NextResponse.json({ ok: true });
}
