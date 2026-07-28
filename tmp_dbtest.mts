import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";
const all = await db.select().from(themes).limit(1);
const t = all[0];
const body = { id: t.id, label: t.label, emoji: t.emoji, prompt: t.prompt + " FULLBODY", previewUrl: t.previewUrl, previewImages: t.previewImages, active: t.active, sortOrder: t.sortOrder, createdAt: t.createdAt };
console.log("setting body with createdAt=", JSON.stringify(t.createdAt));
try {
  const [r] = await db.update(themes).set(body).where(eq(themes.id, t.id)).returning();
  console.log("OK updated prompt=", JSON.stringify(r.prompt));
  await db.update(themes).set({ prompt: t.prompt }).where(eq(themes.id, t.id));
  console.log("reverted");
} catch (e) {
  console.log("ERROR", e instanceof Error ? e.message : e);
}
