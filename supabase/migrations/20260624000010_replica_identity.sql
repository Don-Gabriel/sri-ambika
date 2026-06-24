-- Realtime needs the full old row to evaluate RLS + filters on UPDATE/DELETE,
-- otherwise filtered subscriptions (e.g. the customer's own orders) never fire.
alter table public.orders replica identity full;
