import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  try {
    const res = await fetch("https://api.kie.ai/api/v1/chat/credit", {
      headers: { Authorization: `Bearer ${process.env.KIE_API_KEY}` },
    });
    const j = await res.json() as { code: number; data?: number };
    if (j.code !== 200 || typeof j.data !== "number") {
      return NextResponse.json({ error: "Gagal cek kredit" }, { status: 502 });
    }
    return NextResponse.json({ credits: j.data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
