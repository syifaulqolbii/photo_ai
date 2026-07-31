import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [photo] = await db.select().from(photos).where(eq(photos.id, id));
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ status: photo.status, resultUrl: photo.resultUrl });
}
