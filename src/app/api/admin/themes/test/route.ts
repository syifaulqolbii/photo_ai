import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { supabase, BUCKET } from "@/lib/supabase";
import { KIE, kieHeaders, pollTask } from "@/lib/kie";
import { getKieModels } from "@/lib/kie-models";

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const prompt = String(form.get("prompt") ?? "");
  const model = String(form.get("model") ?? "flux-2/flex-image-to-image");

  const ALLOWED_MODELS = getKieModels().map(m => m.id);
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

  const kieRes = await fetch(`${KIE}/createTask`, {
    method: "POST",
    headers: kieHeaders(),
    body: JSON.stringify({
      model,
      input: { input_urls: [inUrl], prompt, aspect_ratio: "1:1", resolution: "1K", nsfw_checker: false },
    }),
  });
  const kieJson = await kieRes.json() as { code: number; msg: string; data?: { taskId?: string } };
  if (kieJson.code !== 200 || !kieJson.data?.taskId) {
    console.error("[preview-test] kie.ai createTask failed:", kieJson);
    return NextResponse.json({ error: kieJson.msg }, { status: 500 });
  }

  let resultUrl: string;
  let credits: number | null;
  try {
    ({ url: resultUrl, credits } = await pollTask(kieJson.data.taskId));
  } catch (e) {
    console.error("[preview-test] poll failed:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  const imgRes = await fetch(resultUrl);
  const outBuf = Buffer.from(await imgRes.arrayBuffer());
  const outPath = `tester-results/${crypto.randomUUID()}.jpg`;
  await supabase.storage.from(BUCKET).upload(outPath, outBuf, { contentType: "image/jpeg", upsert: true });
  const outUrl = supabase.storage.from(BUCKET).getPublicUrl(outPath).data.publicUrl;

  return NextResponse.json({ imageUrl: outUrl, credits });
}
