import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET } from "@/lib/supabase";

type CallbackData = { taskId?: string; state?: string; resultJson?: string; failMsg?: string };

export async function POST(req: NextRequest) {
  let body: { data?: CallbackData } | null = null;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: true }); }
  const data = body?.data;
  if (!data?.taskId) return NextResponse.json({ ok: true });

  const [photo] = await db.select().from(photos).where(eq(photos.kieTaskId, data.taskId));
  if (!photo) return NextResponse.json({ ok: true });

  if (data.state === "success" && data.resultJson) {
    try {
      const result = JSON.parse(data.resultJson) as { resultUrls?: string[] };
      const url = result.resultUrls?.[0];
      if (!url) throw new Error("resultUrls kosong");
      const imgRes = await fetch(url);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const path = `results/${photo.id}.jpg`;
      await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: "image/jpeg", upsert: true });
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await db.update(photos).set({ status: "done", resultUrl: urlData.publicUrl }).where(eq(photos.id, photo.id));
    } catch (e) {
      console.error("[callback] process result gagal:", e);
      await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photo.id));
    }
  } else if (data.state === "fail") {
    console.error("[callback] task fail:", data.failMsg);
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photo.id));
  }

  return NextResponse.json({ ok: true });
}
