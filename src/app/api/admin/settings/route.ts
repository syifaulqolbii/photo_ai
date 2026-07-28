import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { getSetting, setSetting } from "@/lib/settings";
import { getKieModels } from "@/lib/kie-models";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const models = await getKieModels();
  const userModel = await getSetting("userModel");
  return NextResponse.json({ userModel: userModel ?? models[0]?.id ?? null, models });
}

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { userModel } = await req.json();
  if (!userModel) return NextResponse.json({ error: "userModel wajib" }, { status: 400 });
  const models = await getKieModels();
  if (!models.find(m => m.id === userModel)) return NextResponse.json({ error: "Model tidak valid" }, { status: 400 });
  await setSetting("userModel", userModel);
  return NextResponse.json({ ok: true, userModel });
}
