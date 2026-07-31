import { config } from "dotenv";
config({ path: ".env.local" });
if (!process.env.DATABASE_URL) config({ path: ".env.production" });
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
