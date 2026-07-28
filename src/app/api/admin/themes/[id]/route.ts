import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  if (body.previewImages && Array.isArray(body.previewImages)) body.previewImages = JSON.stringify(body.previewImages);
  try {
    const [t] = await db.update(themes).set(body).where(eq(themes.id, id)).returning();
    if (!t) {
      console.error("[themes PATCH] 0 rows for id=", id);
      return NextResponse.json({ error: "Tema tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(t);
  } catch (e) {
    console.error("[themes PATCH] error id=", id, e);
    return NextResponse.json({ error: "Gagal update tema" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { id } = await params;
  await db.delete(themes).where(eq(themes.id, id));
  return NextResponse.json({ ok: true });
}