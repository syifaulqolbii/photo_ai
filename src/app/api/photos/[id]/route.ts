import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase, BUCKET } from "@/lib/supabase";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [photo] = await db.select().from(photos).where(eq(photos.id, id));
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (photo.status === "processing" && photo.replicateId) {
    const prediction = await replicate.predictions.get(photo.replicateId);

    if (prediction.status === "succeeded") {
      const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output as string;
      const res = await fetch(outputUrl);
      const buffer = await res.arrayBuffer();
      const path = `results/${id}.jpg`;
      await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: "image/jpeg", upsert: true });
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await db.update(photos).set({ status: "done", resultUrl: urlData.publicUrl }).where(eq(photos.id, id));
      return NextResponse.json({ status: "done", resultUrl: urlData.publicUrl });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      await db.update(photos).set({ status: "failed" }).where(eq(photos.id, id));
      return NextResponse.json({ status: "failed" });
    }
  }

  return NextResponse.json({ status: photo.status, resultUrl: photo.resultUrl });
}
