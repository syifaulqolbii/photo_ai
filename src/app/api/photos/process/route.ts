import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos, themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { KIE, kieHeaders } from "@/lib/kie";
import { getUserModel } from "@/lib/kie-models";

export async function POST(req: NextRequest) {
  const { photoId, theme } = await req.json();
  if (!photoId || !theme) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  // ponytail: fetch prompt from DB themes, fallback to generic
  const [themeRow] = await db.select().from(themes).where(eq(themes.id, theme));
  const prompt = themeRow?.prompt ?? "artistic style transformation";

  await db.update(photos).set({ theme, status: "processing" }).where(eq(photos.id, photoId));

  const model = await getUserModel();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host") ?? "localhost:3000"}`;
  const callBackUrl = `${base}/api/kie/callback`;

  const kieRes = await fetch(`${KIE}/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({
      model,
      callBackUrl,
      input: { input_urls: [photo.originalUrl], prompt, aspect_ratio: "auto", resolution: "1K", nsfw_checker: false },
    }),
  });
  const kieJson = await kieRes.json() as { code: number; msg: string; data?: { taskId?: string } };
  if (kieJson.code !== 200 || !kieJson.data?.taskId) {
    await db.update(photos).set({ status: "failed" }).where(eq(photos.id, photoId));
    console.error("[process] kie.ai createTask failed:", kieJson); return NextResponse.json({ error: kieJson.msg }, { status: 500 });
  }

  // ponytail: async — kie.ai memanggil /api/kie/callback saat selesai; request ini langsung balik biar gak kena timeout proxy
  await db.update(photos).set({ kieTaskId: kieJson.data.taskId }).where(eq(photos.id, photoId));
  return NextResponse.json({ status: "processing" });
}
