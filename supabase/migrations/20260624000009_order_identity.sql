-- place_order v3:
--  • logged-in  → name + phone pulled from profile; if a phone is given and the
--    profile has none, save it back. Order shows the real name.
--  • guest      → name auto-assigned as 'Guest-#####'; phone optional.
-- Also adds cancel_order() so a logged-in customer can cancel their own order.

create or replace function public.place_order(
  p_items          jsonb,
  p_fulfilment     text,
  p_payment_method text,
  p_guest_name     text default null,
  p_guest_phone    text default null,
  p_notes          text default null,
  p_pickup_at      timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_item     jsonb;
  v_id       uuid;
  v_qty      int;
  v_row      public.menu_items%rowtype;
  v_subtotal int := 0;
  v_tax      int;
  v_total    int;
  v_order_id uuid;
  v_code     text;
  v_pname    text;
  v_pphone   text;
  v_name     text;
  v_phone    text;
begin
  if p_fulfilment not in ('takeaway','dine_in') then raise exception 'invalid fulfilment'; end if;
  if p_payment_method not in ('cash','online') then raise exception 'invalid payment method'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'cart is empty';
  end if;
  if jsonb_array_length(p_items) > 40 then raise exception 'too many line items'; end if;

  v_phone := nullif(btrim(coalesce(p_guest_phone, '')), '');
  if v_phone is not null and v_phone !~ '^[0-9]{10}$' then
    raise exception 'invalid phone';
  end if;

  if v_uid is not null then
    select full_name, phone into v_pname, v_pphone from public.profiles where id = v_uid;
    v_name  := coalesce(nullif(btrim(coalesce(p_guest_name,'')), ''), v_pname, 'Customer');
    v_phone := coalesce(v_phone, v_pphone);
    -- backfill the profile phone for next time
    if (v_pphone is null or v_pphone = '') and v_phone is not null then
      update public.profiles set phone = v_phone where id = v_uid;
    end if;
  else
    v_name := coalesce(
      nullif(btrim(coalesce(p_guest_name,'')), ''),
      'Guest-' || lpad((floor(random() * 100000))::int::text, 5, '0')
    );
  end if;

  v_code := 'ORD-' || lpad(nextval('public.order_code_seq')::text, 5, '0');

  insert into public.orders (
    code, user_id, guest_name, guest_phone, fulfilment, pickup_at,
    payment_method, subtotal_paise, tax_paise, total_paise, notes
  ) values (
    v_code, v_uid, v_name, v_phone, p_fulfilment, p_pickup_at,
    p_payment_method, 0, 0, 0, nullif(btrim(coalesce(p_notes,'')), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_id  := (v_item->>'menu_item_id')::uuid;
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 50 then raise exception 'invalid quantity'; end if;
    select * into v_row from public.menu_items where id = v_id;
    if not found then raise exception 'menu item % not found', v_id; end if;
    if not v_row.available then raise exception '% is sold out', v_row.name; end if;

    insert into public.order_items (order_id, menu_item_id, name, price_paise, qty)
    values (v_order_id, v_row.id, v_row.name, v_row.price_paise, v_qty);
    v_subtotal := v_subtotal + (v_row.price_paise * v_qty);
  end loop;

  v_tax   := round(v_subtotal * 0.05);
  v_total := v_subtotal + v_tax;
  update public.orders
    set subtotal_paise = v_subtotal, tax_paise = v_tax, total_paise = v_total
    where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id, 'code', v_code,
    'subtotal_paise', v_subtotal, 'tax_paise', v_tax, 'total_paise', v_total
  );
end;
$$;

-- A customer can cancel their OWN order while it's still 'new' or 'preparing'.
create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_order public.orders%rowtype;
begin
  if v_uid is null then raise exception 'please sign in to cancel'; end if;
  select * into v_order from public.orders where id = p_order_id;
  if not found then raise exception 'order not found'; end if;
  if v_order.user_id is distinct from v_uid then raise exception 'not your order'; end if;
  if v_order.status not in ('new','preparing') then
    raise exception 'this order can no longer be cancelled';
  end if;
  update public.orders set status = 'cancelled' where id = p_order_id;
end;
$$;
grant execute on function public.cancel_order(uuid) to authenticated;
