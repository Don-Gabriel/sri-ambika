-- ============================================================================
-- Security hardening
-- ============================================================================

-- ── CRITICAL: block self-service privilege escalation ──────────────────────
-- The profiles_update_self RLS policy lets a user update their own row — which
-- (without this) includes the `role` column. A customer could set role='owner'
-- and gain full admin. This trigger silently preserves the existing role unless
-- the caller is ALREADY an owner.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    new.role := old.role;  -- ignore the attempted role change
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ── Storage: cap upload size + restrict to image types ─────────────────────
update storage.buckets
  set file_size_limit = 5242880,  -- 5 MB
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/gif']
  where id = 'menu-images';
