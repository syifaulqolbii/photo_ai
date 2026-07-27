import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos, themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET } from "@/lib/supabase";
import { KIE, kieHeaders, pollTask } from "@/lib/kie";

export async function POST(req: NextRequest) {
  const { photoId, theme } = await req.json();
  if (!photoId || !theme) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  // ponytail: fetch prompt from DB themes, fallback to generic
  const [themeRow] = await db.select().from(themes).where(eq(themes.id, theme));
  const prompt = themeRow?.prompt ?? "artistic style transformation";

  await db.update(photos).set({ theme, status: "processing" }).where(eq(photos.id, photoId));

  const kieRes = await fetch(`${KIE}/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({
      model: "flux-2/flex-image-to-image",
      input: { input_urls: [photo.originalUrl], prompt, aspect_ratio: "1:1", resolution: "1K", nsfw_checker: false },
    }),
  });

  const kieJson = await kieRes.json() as { code: number; msg: string; data?: { taskId?: string } };
  if (kieJson.code !== 200 || !kieJson.data?.taskId) {
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photoId));
    console.error("[process] kie.ai createTask failed:", kieJson); return NextResponse.json({ error: kieJson.msg }, { status: 500 });
  }

  let imageUrl: string;
  try { ({ url: imageUrl } = await pollTask(kieJson.data.taskId)); }
  catch (e) {
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photoId));
    console.error("[process] poll failed:", e); return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const path = `results/${photoId}.jpg`;
  await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await db.update(photos).set({ status: "done", resultUrl: urlData.publicUrl }).where(eq(photos.id, photoId));
  return NextResponse.json({ status: "done", resultUrl: urlData.publicUrl });
}
