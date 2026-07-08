import { NextRequest, NextResponse } from "next/server";
import { supabase, BUCKET } from "@/lib/supabase";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const ext = file.type.split("/")[1] ?? "jpg";
  const path = `originals/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const [photo] = await db
    .insert(photos)
    .values({ originalUrl: urlData.publicUrl, theme: "pending", status: "pending" })
    .returning({ id: photos.id });

  return NextResponse.json({ photoId: photo.id });
}
