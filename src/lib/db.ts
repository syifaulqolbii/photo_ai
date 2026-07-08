import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// ponytail: family:4 forces IPv4 — VPS Docker has no IPv6 routing to Supabase
const client = postgres(process.env.DATABASE_URL!, { ssl: "require", family: 4 });
export const db = drizzle(client, { schema });
