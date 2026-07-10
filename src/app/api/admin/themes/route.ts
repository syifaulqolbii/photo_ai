import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const all = await db.select().from(themes).orderBy(themes.sortOrder);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const body = await req.json();
  const { id, label, emoji, prompt, previewUrl, previewImages, active, sortOrder } = body;
  if (!id || !label || !prompt) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const [t] = await db.insert(themes).values({ id, label, emoji: emoji ?? "🎨", prompt, previewUrl: previewUrl ?? "", previewImages: JSON.stringify(previewImages ?? []), active: active ?? true, sortOrder: sortOrder ?? 0 }).returning();
  return NextResponse.json(t);
}