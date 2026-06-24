// Promote (or demote) a user to the 'owner' role by email.
// Usage:  npm run set:owner -- someone@example.com
//         npm run set:owner -- someone@example.com customer   (to demote)
import "dotenv/config";
import pg from "pg";

const email = process.argv[2];
const role = process.argv[3] || "owner";
if (!email) {
  console.error("Usage: npm run set:owner -- <email> [owner|customer]");
  process.exit(1);
}
if (!["owner", "customer"].includes(role)) {
  console.error("Role must be 'owner' or 'customer'.");
  process.exit(1);
}

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows } = await c.query(
  `update public.profiles set role=$2
     where id = (select id from auth.users where lower(email)=lower($1))
     returning (select email from auth.users where id=profiles.id) as email, role`,
  [email, role]
);
if (!rows.length) console.error(`✗ No user found with email ${email}. Have them log in once first.`);
else console.log(`✓ ${rows[0].email} is now role='${rows[0].role}'.`);
await c.end();
