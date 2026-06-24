-- Storage bucket for menu/dish images. Public read; only the owner can write.
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "menu_images_public_read" on storage.objects;
create policy "menu_images_public_read" on storage.objects
  for select using (bucket_id = 'menu-images');

drop policy if exists "menu_images_owner_insert" on storage.objects;
create policy "menu_images_owner_insert" on storage.objects
  for insert with check (bucket_id = 'menu-images' and public.is_owner());

drop policy if exists "menu_images_owner_update" on storage.objects;
create policy "menu_images_owner_update" on storage.objects
  for update using (bucket_id = 'menu-images' and public.is_owner());

drop policy if exists "menu_images_owner_delete" on storage.objects;
create policy "menu_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'menu-images' and public.is_owner());
