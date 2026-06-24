-- ============================================================================
-- Row-Level Security — the actual access boundary (not the admin UI).
-- Default-deny: RLS on, then explicit allow policies.
-- ============================================================================

-- is_owner(): SECURITY DEFINER so it reads profiles WITHOUT triggering the
-- profiles RLS policy (avoids infinite recursion).
create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;
grant execute on function public.is_owner() to anon, authenticated;

-- ---------- profiles ----------
alter table public.profiles enable row level security;

create policy profiles_select_self_or_owner on public.profiles
  for select using (id = auth.uid() or public.is_owner());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- categories (public read, owner write) ----------
alter table public.categories enable row level security;

create policy categories_read_all on public.categories
  for select using (true);

create policy categories_write_owner on public.categories
  for all using (public.is_owner()) with check (public.is_owner());

-- ---------- menu_items (public read, owner write) ----------
alter table public.menu_items enable row level security;

create policy menu_read_all on public.menu_items
  for select using (true);

create policy menu_write_owner on public.menu_items
  for all using (public.is_owner()) with check (public.is_owner());

-- ---------- orders ----------
-- No INSERT policy on purpose: orders are created ONLY via place_order()
-- (SECURITY DEFINER), which recomputes totals server-side. This blocks
-- price-tampering from the client.
alter table public.orders enable row level security;

create policy orders_select_own_or_owner on public.orders
  for select using (user_id = auth.uid() or public.is_owner());

create policy orders_update_owner on public.orders
  for update using (public.is_owner()) with check (public.is_owner());

-- ---------- order_items ----------
alter table public.order_items enable row level security;

create policy order_items_select_own_or_owner on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_owner())
    )
  );

create policy order_items_write_owner on public.order_items
  for all using (public.is_owner()) with check (public.is_owner());

-- ---------- payments ----------
alter table public.payments enable row level security;

create policy payments_select_own_or_owner on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_owner())
    )
  );

create policy payments_write_owner on public.payments
  for all using (public.is_owner()) with check (public.is_owner());

-- ---------- audit_log (owner only) ----------
alter table public.audit_log enable row level security;

create policy audit_select_owner on public.audit_log
  for select using (public.is_owner());

create policy audit_insert_owner on public.audit_log
  for insert with check (public.is_owner());
