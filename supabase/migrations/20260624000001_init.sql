-- ============================================================================
-- Sri Ambika — schema init
-- Money is stored as integer PAISE everywhere (never floats).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------- helper: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  role text not null default 'customer' check (role in ('customer','owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a profile row whenever an auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- categories ----------
create table if not exists public.categories (
  id   text primary key,
  name text not null,
  sort int  not null default 0
);

-- ---------- menu_items ----------
create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tamil_name  text,
  description text,
  price_paise int  not null check (price_paise >= 0),
  category_id text references public.categories(id) on delete set null,
  image_url   text,
  available   boolean not null default true,
  is_veg      boolean not null default true,
  spicy       boolean not null default false,
  bestseller  boolean not null default false,
  rating      numeric(2,1) check (rating >= 0 and rating <= 5),
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_menu_items_category on public.menu_items(category_id);
create trigger trg_menu_items_updated
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------- orders ----------
create sequence if not exists public.order_code_seq;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  user_id        uuid references public.profiles(id) on delete set null,
  guest_name     text,
  guest_phone    text,
  fulfilment     text not null check (fulfilment in ('takeaway','dine_in')),
  pickup_at      timestamptz,
  status         text not null default 'new'
                   check (status in ('new','preparing','ready','completed','cancelled')),
  payment_method text not null check (payment_method in ('cash','online')),
  payment_status text not null default 'pending'
                   check (payment_status in ('pending','paid','failed','refunded')),
  subtotal_paise int not null check (subtotal_paise >= 0),
  tax_paise      int not null check (tax_paise >= 0),
  total_paise    int not null check (total_paise >= 0),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_orders_user    on public.orders(user_id);
create index if not exists idx_orders_status  on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- order_items (price + name SNAPSHOT) ----------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name         text not null,
  price_paise  int  not null check (price_paise >= 0),
  qty          int  not null check (qty > 0)
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------- payments (Razorpay, later) ----------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  provider            text not null default 'razorpay',
  provider_order_id   text,
  provider_payment_id text,
  amount_paise        int  not null check (amount_paise >= 0),
  status              text not null default 'created',
  created_at          timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);

-- ---------- audit_log ----------
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid references public.profiles(id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  text,
  meta       jsonb,
  created_at timestamptz not null default now()
);
