const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env.production");
  try {
    const txt = fs.readFileSync(envPath, "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL tidak diset");
  process.exit(1);
}

const sql = postgres(url, {
  ssl: { rejectUnauthorized: false },
  prepare: false,
  idle_timeout: 2,
  connect_timeout: 10,
});

sql`select 1 as ok`
  .then(() => {
    console.log(new Date().toISOString(), "keepalive: ok");
    return sql.end();
  })
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(new Date().toISOString(), "keepalive: gagal -", e.message);
    process.exit(1);
  });
