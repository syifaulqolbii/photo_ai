import { NextRequest, NextResponse } from "next/server";

export async function requireSession(req: NextRequest) {
  const session = req.cookies.get("pb_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
