// Create / update the admin owner credential (username + password, no email/phone).
// Stored via Supabase password auth under a hidden internal email.
// Usage:  npm run set:admin -- <username> <password> [Display Name]
import "dotenv/config";
import pg from "pg";

const [username, password, ...rest] = process.argv.slice(2);
const name = rest.join(" ") || "Owner";

if (!username || !password) {
  console.error("Usage: npm run set:admin -- <username> <password> [Display Name]");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

const email = `${username.toLowerCase().replace(/[^a-z0-9._-]/g, "")}@sriambika.local`;
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const existing = await c.query("select id from auth.users where email=$1", [email]);

if (existing.rows.length) {
  await c.query(
    `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = now(), updated_at = now()
       where email = $1`,
    [email, password]
  );
} else {
  await c.query(
    `insert into auth.users
       (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
     values
       ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        $1, crypt($2, gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', $3::text))`,
    [email, password, name]
  );
}

// GoTrue 500s if these token columns are NULL — it expects empty strings.
await c.query(
  `update auth.users set
     confirmation_token        = coalesce(confirmation_token, ''),
     recovery_token            = coalesce(recovery_token, ''),
     email_change              = coalesce(email_change, ''),
     email_change_token_new    = coalesce(email_change_token_new, ''),
     email_change_token_current= coalesce(email_change_token_current, ''),
     phone_change              = coalesce(phone_change, ''),
     phone_change_token        = coalesce(phone_change_token, ''),
     reauthentication_token    = coalesce(reauthentication_token, '')
   where email = $1`,
  [email]
);

await c.query(
  `update public.profiles set role='owner', full_name=$2
     where id = (select id from auth.users where email=$1)`,
  [email, name]
);

console.log(`\n✓ Admin owner ready.`);
console.log(`  Username: ${username}`);
console.log(`  Sign in at the admin app (http://localhost:3001).\n`);
await c.end();
