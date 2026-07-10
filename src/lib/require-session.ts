import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function requireSession(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}