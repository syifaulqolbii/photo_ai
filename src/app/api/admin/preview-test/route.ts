import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { supabase, BUCKET } from "@/lib/supabase";
import { KIE, kieHeaders, fetchCreditBalance, safeJson } from "@/lib/kie";
import { getKieModels } from "@/lib/kie-models";
import { db } from "@/lib/db";
import { kieTestResults } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const prompt = String(form.get("prompt") ?? "");
  const model = String(form.get("model") ?? "flux-2/flex-image-to-image");
  const themeId = String(form.get("themeId") ?? "");

  const ALLOWED_MODELS = (await getKieModels()).map(m => m.id);
  if (!ALLOWED_MODELS.includes(model)) {
    return NextResponse.json({ error: "Model tidak diizinkan" }, { status: 401 });
  }
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File gambar wajib diupload" }, { status: 400 });
  }
  if (!prompt) return NextResponse.json({ error: "Prompt wajib diisi" }, { status: 400 });

  const inBuf = Buffer.from(await file.arrayBuffer());
  const inPath = `tester/${crypto.randomUUID()}.jpg`;
  await supabase.storage.from(BUCKET).upload(inPath, inBuf, { contentType: file.type, upsert: true });
  const inUrl = supabase.storage.from(BUCKET).getPublicUrl(inPath).data.publicUrl;

  const before = await fetchCreditBalance();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host") ?? "localhost:3000"}`;
  const callBackUrl = `${base}/api/kie/callback-test`;

  const kieRes = await fetch(`${KIE}/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({
      model,
      callBackUrl,
      input: { input_urls: [inUrl], prompt, aspect_ratio: "auto", resolution: "1K", nsfw_checker: false },
    }),
  });
  const r = await safeJson(kieRes);
  if (!r.ok || r.json?.code !== 200 || !r.json?.data?.taskId) {
    console.error("[preview-test] kie.ai createTask failed:", r.text.slice(0, 400));
    return NextResponse.json({ error: "kie.ai gagal: " + (r.json?.msg ?? "respons non-JSON (cek API key / koneksi)") }, { status: 500 });
  }
  const taskId = r.json.data.taskId as string;
  // ponytail: async — kie.ai panggil /api/kie/callback-test saat selesai; request ini langsung balik
  await db.insert(kieTestResults).values({ taskId, themeId: themeId || null, status: "processing", beforeBalance: before });
  return NextResponse.json({ taskId, status: "processing" });
}

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
  const [row] = await db.select().from(kieTestResults).where(eq(kieTestResults.taskId, taskId));
  if (!row) return NextResponse.json({ status: "not_found" });
  return NextResponse.json({ status: row.status, imageUrl: row.imageUrl, credits: row.credits });
}
