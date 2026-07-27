import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { getKieModels } from "@/lib/kie-models";
import { db } from "@/lib/db";
import { kieModels } from "@/db/schema";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const models = await getKieModels();
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { id, label } = await req.json();
  if (!id || !label) return NextResponse.json({ error: "id & label wajib" }, { status: 400 });
  try {
    const [row] = await db.insert(kieModels).values({ id: String(id), label: String(label) }).returning();
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Model id sudah ada" }, { status: 409 });
  }
}
