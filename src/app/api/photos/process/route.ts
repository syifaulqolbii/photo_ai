import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { THEME_PROMPTS } from "@/lib/themes";
import { supabase, BUCKET } from "@/lib/supabase";

const CF_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

export async function POST(req: NextRequest) {
  const { photoId, theme } = await req.json();
  if (!photoId || !theme) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  await db.update(photos).set({ theme, status: "processing" }).where(eq(photos.id, photoId));

  const cfRes = await fetch(CF_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: THEME_PROMPTS[theme] ?? "artistic style transformation", num_steps: 4 }),
  });

  if (!cfRes.ok) {
    const err = await cfRes.text();
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photoId));
    return NextResponse.json({ error: err }, { status: cfRes.status });
  }

  // ponytail: CF flux returns JSON { result: { image: base64 } }
  const json = await cfRes.json() as { result?: { image?: string } };
  const b64 = json?.result?.image;
  if (!b64) {
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photoId));
    return NextResponse.json({ error: "No image in CF response" }, { status: 500 });
  }

  const buffer = Buffer.from(b64, "base64");
  const path = `results/${photoId}.jpg`;
  await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await db.update(photos).set({ status: "done", resultUrl: urlData.publicUrl }).where(eq(photos.id, photoId));
  return NextResponse.json({ status: "done", resultUrl: urlData.publicUrl });
}
