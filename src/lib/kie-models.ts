import { db } from "@/lib/db";
import { kieModels } from "@/db/schema";

const DEFAULTS = [
  { id: "flux-2/flex-image-to-image", label: "Flux 2 Flex (I2I)" },
  { id: "flux-2/pro-image-to-image", label: "Flux 2 Pro (I2I)" },
  { id: "gpt-image-2-image-to-image", label: "GPT Image 2 (I2I)" },
];

export type KieModelRow = { id: string; label: string };

export async function getKieModels(): Promise<KieModelRow[]> {
  let rows = await db.select().from(kieModels).orderBy(kieModels.label);
  if (rows.length === 0) {
    await db.insert(kieModels).values(DEFAULTS).onConflictDoNothing();
    rows = await db.select().from(kieModels).orderBy(kieModels.label);
  }
  return rows;
}
