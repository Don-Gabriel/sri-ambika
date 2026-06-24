<div align="center">

# 🍛 Sri Ambika

### A cinematic, full-stack ordering platform for a South-Indian tiffin house in Pulianthope, Chennai.

*From a humble corner plot to a digital landmark — crisp dosa, fluffy uttapam and degree filter coffee, ordered in a tap.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Remotion](https://img.shields.io/badge/Remotion-444444?style=for-the-badge&logo=react&logoColor=61DAFB)](https://www.remotion.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
![Monorepo](https://img.shields.io/badge/Monorepo-npm_workspaces-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

<div align="center">

|  |  |
| :---: | :---: |
| ![Landing](docs/screenshots/landing.png) | ![Menu](docs/screenshots/menu.png) |
| **Cinematic scroll-scrub landing** | **Live, RLS-backed menu** |
| ![Admin](docs/screenshots/admin.png) | <img src="docs/screenshots/mobile.png" width="240" /> |
| **Owner kitchen console** | **Mobile-first, hero-lite** |

</div>

---

## ✨ Overview

**Sri Ambika** is a real ordering platform built for a small pure-veg tiffin shop. It pairs a **cinematic, editorial customer experience** with a **practical, single-owner kitchen console** — two separately-deployable apps sharing one type-safe database layer.

Two ideas drive the whole build:

1. **The storefront should feel like a flagship.** A 300-frame scroll-scrubbing hero (an empty plot building into a sunlit landmark), glassmorphism, neumorphism, claymorphism, a bento grid, film grain, kinetic type, a marquee of real Google reviews, and a Remotion-rendered brand reel.
2. **The kitchen tools should be dead simple.** Username + password for the owner, live incoming orders, one-tap status flow, menu & category management with photo uploads, and clean PDF sales reports.

---

## 🧭 Features

<table>
<tr>
<td width="50%" valign="top">

### 🙋 Customer app (`apps/web`)
- 🎞️ **Scroll-scrub hero** — 300 frames scrubbed to scroll on desktop; an automatic **lightweight static hero on mobile** (no 40 MB download)
- 🍽️ **Live menu** — categories, availability, Tamil names, bestseller/spicy badges, 3-D tilt + spotlight cards
- 🛒 **Cart & checkout** — guest **or** Google account, GST bill, pickup / dine-in
- 👤 **Google Sign-In** + guest checkout (auto `Guest-#####` identity)
- 📜 **Order history** with **live status** (Supabase Realtime)
- 🔁 **One-tap reorder** & **self-service cancel**
- 📱 Fully responsive, `prefers-reduced-motion` aware

</td>
<td width="50%" valign="top">

### 👨‍🍳 Owner console (`apps/admin`)
- 🔐 **Username + password** login (no email/phone needed)
- ⚡ **Live orders** stream in via Realtime
- 🟢 **Status flow** — New → Preparing → Ready → Completed, + mark paid
- 🗂️ **History** tab — completed & cancelled, read-only, filterable
- 🍲 **Menu management** — availability, inline price, add/remove, **photo upload to Storage**
- 🏷️ **Category management** — create/assign categories on the fly
- 📊 **Reports** — today / month / custom range + **clean branded PDF export**
- 🔎 Search & filters everywhere · mobile-friendly

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 14 (App Router) · React 18 · TypeScript |
| **Styling** | Tailwind CSS · custom design system (glass / neu / clay tokens) |
| **Motion** | Framer Motion · canvas scroll-scrubbing · **Remotion** brand reel |
| **State** | Zustand (cart, local UI) |
| **Backend** | Supabase — PostgreSQL · Auth · Storage · Realtime |
| **Security** | Row-Level Security · `SECURITY DEFINER` RPCs · server-recomputed totals |
| **Tooling** | npm workspaces monorepo · `sharp` (image pipeline) · `pg` (zero-Docker migrations) · `jspdf` (reports) |
| **Design intelligence** | UI/UX Pro Max skill — Playfair Display + Karla, sunset-amber palette |

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client
        WEB["🙋 apps/web<br/>Customer · :3000"]
        ADM["👨‍🍳 apps/admin<br/>Owner · :3001"]
    end
    subgraph Shared
        DB["📦 packages/db<br/>typed client · Zod · money helpers"]
    end
    subgraph Supabase["☁️ Supabase (Postgres)"]
        AUTH["Auth<br/>Google OAuth · password"]
        RLS["Row-Level Security"]
        RPC["place_order() / cancel_order()<br/>SECURITY DEFINER"]
        RT["Realtime"]
        ST["Storage<br/>menu-images"]
    end

    WEB --> DB
    ADM --> DB
    DB --> AUTH
    DB --> RLS
    DB --> RPC
    DB --> RT
    ADM --> ST
    RPC --> RLS

    classDef sb fill:#1A1110,stroke:#E8A33D,color:#FBF6EC;
    class AUTH,RLS,RPC,RT,ST sb;
```

> **Security boundary is the database, not the UI.** Both apps talk to the same Postgres; **RLS policies** decide who can read/write. Orders are created *only* through `place_order()`, which recomputes every price server-side — the client can never tamper with totals.

### 🧾 Order flow

```mermaid
sequenceDiagram
    actor C as Customer
    participant W as apps/web
    participant P as place_order() RPC
    participant DB as Postgres
    participant A as apps/admin (owner)

    C->>W: Add items, checkout
    W->>P: rpc(items, fulfilment, name?, phone?)
    P->>DB: re-price from menu_items, snapshot lines
    P-->>W: ORD-#####, server-computed total
    DB-->>A: ⚡ Realtime INSERT (new order)
    A->>DB: status → preparing → ready → completed
    DB-->>W: ⚡ Realtime UPDATE (live status)
```

### 🗄️ Data model

```mermaid
erDiagram
    profiles ||--o{ orders : places
    orders ||--|{ order_items : contains
    menu_items ||--o{ order_items : "snapshot of"
    categories ||--o{ menu_items : groups
    orders ||--o| payments : has

    profiles { uuid id PK "= auth.users" text full_name text phone text role }
    menu_items { uuid id PK int price_paise bool available text category_id }
    orders { uuid id PK text code text status int total_paise text guest_name }
    order_items { uuid id PK text name int price_paise int qty }
    categories { text id PK text name int sort }
```

> 💰 **Money is stored as integer paise everywhere** — never floats.

---

## 📁 Project structure

```
sri-ambika/
├─ apps/
│  ├─ web/                  # customer site  → :3000  (Google sign-in + guest)
│  │  ├─ app/               #   landing · menu · order · account · login
│  │  └─ src/components/    #   ScrollHero, MobileHero, DishCard, OrderClient…
│  └─ admin/                # owner console  → :3001  (username + password)
│     └─ src/components/    #   Dashboard, Orders/History/Menu/Reports panels
├─ packages/
│  └─ db/                   # shared Supabase client, types, Zod schemas, money
├─ supabase/
│  └─ migrations/           # schema · RLS · place_order · storage · realtime…
├─ scripts/                 # zero-Docker migration runner, owner/admin setup, frame upscaler
├─ images/                  # 300 pristine source hero frames (QHD)
└─ docs/screenshots/        # README imagery
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+**
- A **Supabase** project (free tier is fine — region `ap-south-1` recommended)

### 1 · Install
```bash
npm install
```

### 2 · Configure environment
Public keys go in each app; **secrets stay server-side and are git-ignored.**

```bash
# apps/web/.env.local   &   apps/admin/.env.local  (PUBLIC values)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>

# .env  (root — used ONLY by the migration scripts)
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres
```
> 🔴 The `service_role` key and DB password are **secrets** — never commit them, never put them in a `NEXT_PUBLIC_` variable. `.env*` files are git-ignored; `.env.example` templates are provided.

### 3 · Create the database
Zero Docker, zero Supabase CLI — a tiny `pg` runner applies every migration in order:
```bash
npm run db:push     # tables, RLS, functions, storage, seed
npm run db:check    # prints table counts + the seeded menu
```

### 4 · Create the owner account
```bash
npm run set:admin -- owner 'YourStrongPassword' 'Shop Owner'
```

### 5 · Run
```bash
npm run dev:web     # → http://localhost:3000   (customer)
npm run dev:admin   # → http://localhost:3001   (owner console)
```

---

## 📜 Scripts

| Script | What it does |
| --- | --- |
| `npm run dev:web` / `dev:admin` | Run the customer / admin app |
| `npm run build:web` / `build:admin` | Production build |
| `npm run db:push` | Apply SQL migrations to Supabase (no Docker) |
| `npm run db:check` | Sanity-check tables & seed |
| `npm run set:admin -- <user> <pass> [name]` | Create/update the owner login |
| `npm run set:owner -- <email> [role]` | Promote/demote a Google account |
| `npm run upscale:frames` | Re-encode hero frames (`sharp`) |

---

## 🔒 Security highlights

- **Row-Level Security** on every table — public reads the menu, users see only *their* orders, only the owner writes.
- **No price tampering** — `place_order()` is `SECURITY DEFINER` and recomputes subtotal, 5 % GST and total from the database, ignoring any amounts the client sends.
- **Per-app session isolation** — distinct auth cookies (`sb-sriambika-web` / `-admin`) so the two apps never share a session, even on `localhost`.
- **Verified writes** — admin mutations confirm rows actually changed (catching silent RLS rejections).
- **Secrets discipline** — `service_role` only ever lives server-side; the customer bundle ships nothing but the public anon key.

---

## 🎨 Design language

A premium, cinematic system layered from many techniques — **glassmorphism · neumorphism · claymorphism · bento grid · aurora gradients · film grain · duotone imagery · kinetic typography · 3-D tilt & spotlight · magnetic buttons**.

| Token | Value |
| --- | --- |
| Display / Body | Playfair Display · Karla |
| Espresso | `#1A1110` |
| Sunset amber | `#E8A33D` |
| Terracotta | `#C0392B` |
| Banana-leaf | `#3A7D44` |
| Ivory | `#FBF6EC` |

---

## 🗺️ Roadmap

- [x] Cinematic landing + menu + cart/checkout
- [x] Supabase backend, RLS, secure ordering RPC
- [x] Google sign-in + guest checkout · order history · reorder · cancel
- [x] Owner console — live orders, menu/category management, history
- [x] Reports + clean PDF export
- [x] Mobile pass (hero-lite + responsive)
- [ ] 💳 Razorpay / UPI online payments
- [ ] 🔔 Order notifications (WhatsApp / email)
- [ ] 🛡️ OWASP hardening + rate limiting
- [ ] 🚀 Two-host production deploy (custom domains)

---

<div align="center">

**Sri Ambika** · Pulianthope, Chennai · *Tiffin, perfected.*

Crafted with cinematic scroll, glass &amp; grain.

</div>
