import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const { dark } = await req.json() as { dark: boolean };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("dark_mode", dark ? "1" : "0", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}