-- ============================================================================
-- place_order(): the ONLY way an order is created.
-- SECURITY DEFINER → recomputes prices/tax from the DB, ignoring any amounts
-- the client sends. Validates availability. Works for guests and logged-in users.
-- ============================================================================

create or replace function public.place_order(
  p_items          jsonb,                      -- [{ "menu_item_id": uuid, "qty": int }, ...]
  p_fulfilment     text,                       -- 'takeaway' | 'dine_in'
  p_payment_method text,                       -- 'cash' | 'online'
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
  v_uid        uuid := auth.uid();
  v_item       jsonb;
  v_id         uuid;
  v_qty        int;
  v_row        public.menu_items%rowtype;
  v_subtotal   int := 0;
  v_tax        int;
  v_total      int;
  v_order_id   uuid;
  v_code       text;
  v_count      int;
begin
  -- basic validation
  if p_fulfilment not in ('takeaway','dine_in') then
    raise exception 'invalid fulfilment';
  end if;
  if p_payment_method not in ('cash','online') then
    raise exception 'invalid payment method';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'cart is empty';
  end if;
  if jsonb_array_length(p_items) > 40 then
    raise exception 'too many line items';
  end if;

  -- guests must identify themselves
  if v_uid is null then
    if coalesce(btrim(p_guest_name), '') = ''
       or coalesce(btrim(p_guest_phone), '') = '' then
      raise exception 'guest name and phone are required';
    end if;
    if p_guest_phone !~ '^[0-9]{10}$' then
      raise exception 'invalid phone';
    end if;
  end if;

  -- create the order shell (totals filled after we price the lines)
  v_code := 'ORD-' || lpad(nextval('public.order_code_seq')::text, 5, '0');

  insert into public.orders (
    code, user_id, guest_name, guest_phone, fulfilment, pickup_at,
    payment_method, subtotal_paise, tax_paise, total_paise, notes
  ) values (
    v_code, v_uid,
    case when v_uid is null then btrim(p_guest_name) else null end,
    case when v_uid is null then btrim(p_guest_phone) else null end,
    p_fulfilment, p_pickup_at, p_payment_method, 0, 0, 0, nullif(btrim(p_notes), '')
  )
  returning id into v_order_id;

  -- price every line from the DB (authoritative), snapshotting name + price
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_id  := (v_item->>'menu_item_id')::uuid;
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'invalid quantity';
    end if;

    select * into v_row from public.menu_items where id = v_id;
    if not found then
      raise exception 'menu item % not found', v_id;
    end if;
    if not v_row.available then
      raise exception '% is sold out', v_row.name;
    end if;

    insert into public.order_items (order_id, menu_item_id, name, price_paise, qty)
    values (v_order_id, v_row.id, v_row.name, v_row.price_paise, v_qty);

    v_subtotal := v_subtotal + (v_row.price_paise * v_qty);
  end loop;

  -- GST 5% on restaurant service
  v_tax   := round(v_subtotal * 0.05);
  v_total := v_subtotal + v_tax;

  update public.orders
    set subtotal_paise = v_subtotal,
        tax_paise      = v_tax,
        total_paise    = v_total
    where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'code', v_code,
    'subtotal_paise', v_subtotal,
    'tax_paise', v_tax,
    'total_paise', v_total
  );
end;
$$;

grant execute on function public.place_order(jsonb, text, text, text, text, text, timestamptz)
  to anon, authenticated;
