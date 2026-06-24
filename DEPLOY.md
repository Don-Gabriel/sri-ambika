# Deploying Sri Ambika (free, GitHub + Vercel)

Two free Vercel projects from this one repo — the **customer** app and the
**admin** app — each on a free `*.vercel.app` domain. No custom domain needed.

> The repo is already deploy-ready (both apps build cleanly). You only do the
> Vercel + dashboard steps below — about 15 minutes.

---

## 0 · Prerequisites
- This repo on GitHub ✔ (`Don-Gabriel/sri-ambika`)
- A **Vercel** account → sign up at [vercel.com](https://vercel.com) **with your GitHub** (free "Hobby" plan)

---

## 1 · Deploy the CUSTOMER app
1. Vercel → **Add New → Project** → **Import** `Don-Gabriel/sri-ambika`.
2. In the configure screen:
   - **Root Directory** → click *Edit* → choose **`apps/web`**
   - Framework Preset: **Next.js** (auto-detected)
3. Expand **Environment Variables** and add these **5** (copy each value from your local `apps/web/.env.local`):

   | Name | Notes |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | public |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public |
   | `TURNSTILE_SECRET_KEY` | 🔴 secret |
   | `SUPABASE_SERVICE_ROLE_KEY` | 🔴 secret |

4. **Deploy.** When it finishes you get a URL like **`https://sri-ambika-web.vercel.app`** — note it as **WEB_URL**.

---

## 2 · Deploy the ADMIN app
1. Vercel → **Add New → Project** → **Import the SAME repo again**.
2. **Root Directory** → **`apps/admin`**.
3. Environment Variables — just **2**:

   | Name |
   |------|
   | `NEXT_PUBLIC_SUPABASE_URL` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

   *(The admin needs NO secrets — it uses the owner's login + RLS.)*
4. **Deploy.** You get **`https://sri-ambika-admin.vercel.app`** — note it as **ADMIN_URL**.

> Tip: give the projects clear names (`sri-ambika-web`, `sri-ambika-admin`) — the
> name becomes the subdomain.

---

## 3 · Point the services at your live URLs

### Supabase → Authentication → URL Configuration
- **Site URL:** `WEB_URL`
- **Redirect URLs:** add **both**
  - `WEB_URL/**`
  - `ADMIN_URL/**`

### Cloudflare Turnstile → your widget → Settings → Hostnames
- Add the host of **WEB_URL** (e.g. `sri-ambika-web.vercel.app`). Keep `localhost`.

### Google Cloud Console → APIs & Services → Credentials → your OAuth client
- **Authorized JavaScript origins:** add `WEB_URL`
- (The redirect URI stays the Supabase one — no change.)

---

## 4 · Test
- Open **WEB_URL** → browse menu → **Continue with Google** → place an order.
- Open **ADMIN_URL** → log in (username `owner`) → the order should appear live.

---

## Notes
- **Auto-deploy:** every `git push` to `main` redeploys both apps automatically.
- **Env changes** require a redeploy (Vercel → project → Deployments → Redeploy).
- **Monorepo install:** Vercel auto-detects the npm workspace and installs from
  the repo root. If a build ever fails with "`@sriambika/db` not found", set the
  project's **Install Command** to `npm install` (run from root) in Settings.
- **Free tier:** Vercel Hobby is intended for non-commercial use. It's perfect
  for launch/testing/small volume; if the shop grows into steady commercial
  traffic, Vercel Pro ($20/mo) or another host is the upgrade path.
- **Secrets:** `TURNSTILE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` live only
  in the **customer** project's server env on Vercel — never exposed to browsers.
