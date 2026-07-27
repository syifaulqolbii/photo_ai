import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  const expected = process.env.ACCESS_CODE;
  if (!expected || code !== expected) {
    return NextResponse.json({ error: "Kode salah" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pb_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
