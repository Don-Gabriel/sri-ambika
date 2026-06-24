# Sri Ambika — setup

Monorepo (npm workspaces):

```
apps/web      → customer site   → npm run dev:web    (http://localhost:3000)
apps/admin    → owner console    → npm run dev:admin  (http://localhost:3001)
packages/db   → shared Supabase client, types, Zod schemas, money helpers
supabase/migrations → the database schema (run with npm run db:push)
```

## One-time: point it at your Supabase project

Public keys are already set in `apps/web/.env.local`. You only need to add **one secret** to run the database migrations:

1. Open the git-ignored **`.env`** file in the repo root.
2. Replace `[YOUR-PASSWORD]` with your Supabase **database password**.
   - If your network is IPv4-only and it can't connect, replace the whole
     `DATABASE_URL` line with the **Session pooler** string from
     Supabase → *Project Settings → Database → Connection string*.
3. Run the migrations:

   ```bash
   npm install        # first time only
   npm run db:push    # creates tables, RLS, functions, seeds the 5 menu items
   npm run db:check   # prints table counts + the seeded menu to confirm
   ```

## The secret-handling rule

| Secret | Where it goes | Used by |
|--------|---------------|---------|
| DB password | root `.env` (`DATABASE_URL`) | migration scripts only |
| anon / publishable key | `apps/web/.env.local` (public) | customer app |
| **service_role key** | `apps/admin/.env.local` **only** (Phase 3) | admin server code |

🔴 The **service_role** key bypasses all security — it must never appear in
`apps/web` or in any `NEXT_PUBLIC_` variable. It isn't needed yet.

## Run the apps

```bash
npm run dev:web      # customer  → :3000
npm run dev:admin    # admin     → :3001
```
