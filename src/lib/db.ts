import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const url = new URL(process.env.DATABASE_URL!);
// ponytail: explicit servername forces SNI in Docker — Supavisor needs it to identify tenant
const client = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false, servername: url.hostname },
  prepare: false,
});
export const db = drizzle(client, { schema });
