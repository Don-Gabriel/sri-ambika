// Generates a one-time owner sign-in link WITHOUT sending an email
// (uses the admin API, so it ignores the email rate limit).
//
// Needs SUPABASE_SERVICE_ROLE_KEY in the root .env (server-only secret).
// Usage:  npm run admin:link -- dongabriel.jrks@gmail.com
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lzkokyjkvxqkamfyzxmw.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!key) {
  console.error(
    "\n✗ SUPABASE_SERVICE_ROLE_KEY not found in root .env.\n" +
      "  Add this line to the .env file (it's git-ignored, never commit it):\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key\n"
  );
  process.exit(1);
}
if (!email) {
  console.error("Usage: npm run admin:link -- <owner-email>");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await admin.auth.admin.generateLink({
  type: "magiclink",
  email,
  options: { redirectTo: "http://localhost:3001/auth/callback" },
});

if (error) {
  console.error("✗ " + error.message);
  process.exit(1);
}
console.log("\n✓ Paste this link into your browser to sign in to the ADMIN app:\n");
console.log(data.properties.action_link + "\n");
