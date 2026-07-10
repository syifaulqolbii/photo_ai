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
  const [t] = await db.update(themes).set(body).where(eq(themes.id, id)).returning();
  return NextResponse.json(t);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { id } = await params;
  await db.delete(themes).where(eq(themes.id, id));
  return NextResponse.json({ ok: true });
}