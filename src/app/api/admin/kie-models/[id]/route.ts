import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { db } from "@/lib/db";
import { kieModels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { id } = await params;
  await db.delete(kieModels).where(eq(kieModels.id, id));
  return NextResponse.json({ ok: true });
}
