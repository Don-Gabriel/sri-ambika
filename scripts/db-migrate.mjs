// Runs supabase/migrations/*.sql against your Supabase Postgres, in order, once
// each. No Docker / no Supabase CLI required.
//
// Reads DATABASE_URL from the root .env (git-ignored). Each migration runs in a
// transaction and is recorded in public.schema_migrations so re-running is safe.

import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url || url.includes("[YOUR-PASSWORD]")) {
  console.error(
    "\n✗ DATABASE_URL is missing or still has the [YOUR-PASSWORD] placeholder.\n" +
      "  Edit the root .env file and paste your real Supabase DB password.\n"
  );
  process.exit(1);
}

const dir = path.resolve(process.cwd(), "supabase/migrations");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  await client.query(`
    create table if not exists public.schema_migrations (
      version    text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await client.query("select version from public.schema_migrations");
  const done = new Set(rows.map((r) => r.version));

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`• skip   ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(path.join(dir, file), "utf8");
    process.stdout.write(`→ apply  ${file} … `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public.schema_migrations(version) values ($1)", [file]);
      await client.query("commit");
      console.log("done");
      applied++;
    } catch (e) {
      await client.query("rollback");
      console.log("FAILED");
      console.error(`\n✗ ${file} failed:\n  ${e.message}\n`);
      process.exit(1);
    }
  }

  console.log(`\n✓ Migrations complete. ${applied} applied, ${files.length - applied} skipped.`);
  await client.end();
}

main().catch(async (e) => {
  console.error("\n✗ Could not run migrations:", e.message);
  if (/ENOTFOUND|ETIMEDOUT|EAI_AGAIN/.test(e.message)) {
    console.error(
      "  Network/DNS issue reaching the DB host. If you're on an IPv4-only network,\n" +
        "  use the 'Session pooler' connection string from the Supabase dashboard\n" +
        "  (Project Settings → Database → Connection string → Session pooler).\n"
    );
  }
  try { await client.end(); } catch {}
  process.exit(1);
});
