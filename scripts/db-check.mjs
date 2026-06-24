// Quick sanity check: connects with DATABASE_URL and prints table counts.
import "dotenv/config";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url || url.includes("[YOUR-PASSWORD]")) {
  console.error("✗ Set DATABASE_URL in root .env first.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const q = async (label, sql) => {
  try {
    const { rows } = await client.query(sql);
    console.log(`${label.padEnd(16)} ${rows[0].n}`);
  } catch (e) {
    console.log(`${label.padEnd(16)} (n/a — ${e.message})`);
  }
};

await client.connect();
console.log("Connected ✓\n");
await q("categories", "select count(*) n from public.categories");
await q("menu_items", "select count(*) n from public.menu_items");
await q("orders", "select count(*) n from public.orders");
await q("profiles", "select count(*) n from public.profiles");
console.log("");
const { rows } = await client.query(
  "select name, price_paise, available from public.menu_items order by sort"
);
for (const r of rows) {
  console.log(`  • ${r.name.padEnd(26)} ₹${(r.price_paise / 100).toFixed(0).padStart(4)}  ${r.available ? "available" : "SOLD OUT"}`);
}
await client.end();
