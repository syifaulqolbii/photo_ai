import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const photoStatusEnum = pgEnum("photo_status", [
  "pending",
  "processing",
  "done",
  "failed",
]);

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalUrl: text("original_url").notNull(),
  resultUrl: text("result_url"),
  theme: text("theme").notNull(),
  status: photoStatusEnum("status").notNull().default("pending"),
  replicateId: text("replicate_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
