import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { db } from "@/lib/db";
import { photos } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = 10;
  const offset = (page - 1) * limit;
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(photos);
  const [done] = await db.select({ count: sql<number>`count(*)` }).from(photos).where(eq(photos.status, "done"));
  const byTheme = await db.select({ theme: photos.theme, count: sql<number>`count(*)` }).from(photos).where(eq(photos.status, "done")).groupBy(photos.theme).orderBy(sql`count(*) desc`);
  const recent = await db.select().from(photos).orderBy(sql`created_at desc`).limit(limit).offset(offset);
  const totalPages = Math.ceil(Number(total.count) / limit);
  return NextResponse.json({ total: Number(total.count), done: Number(done.count), byTheme, recent, page, totalPages });
}