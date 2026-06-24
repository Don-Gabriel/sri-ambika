-- ============================================================================
-- Seed: categories + the 5 launch menu items. Idempotent (fixed ids).
-- Image URLs point at apps/web/public/food/*. Admin uploads will later
-- replace these with Supabase Storage URLs.
-- ============================================================================

insert into public.categories (id, name, sort) values
  ('Combos',    'Combos',    1),
  ('Dosa',      'Dosa',      2),
  ('Tiffin',    'Tiffin',    3),
  ('Chaat',     'Chaat',     4),
  ('Beverages', 'Beverages', 5)
on conflict (id) do update set name = excluded.name, sort = excluded.sort;

insert into public.menu_items
  (id, name, tamil_name, description, price_paise, category_id, image_url,
   available, is_veg, spicy, bestseller, rating, sort)
values
  ('00000000-0000-0000-0000-000000000001',
   'Sri Ambika Special Box', 'ஸ்பெஷல் பாக்ஸ்',
   'Our signature loaded box — crisp fritters, golden fries and house chutney. The crowd-puller on every table.',
   18000, 'Combos', '/food/food-1.jpg', true, true, false, true, 4.6, 1),

  ('00000000-0000-0000-0000-000000000002',
   'Masala Dosa', 'மசாலா தோசை',
   'Stone-ground batter fermented overnight, ribboned thin on the griddle, wrapped around spiced potato masala.',
   9000, 'Dosa', '/food/food-2.jpg', true, true, true, true, 4.4, 2),

  ('00000000-0000-0000-0000-000000000003',
   'Onion Uttapam', 'வெங்காய ஊத்தப்பம்',
   'Thick, fluffy and griddle-kissed with sweet onions — exactly the breakfast the RTO regulars swear by.',
   8000, 'Tiffin', '/food/food-3.jpg', true, true, false, false, 4.2, 3),

  ('00000000-0000-0000-0000-000000000004',
   'Poori Channa', 'பூரி சென்னா',
   'Puffed golden pooris with slow-cooked channa masala. ''Superb'' — and the regulars are rarely wrong.',
   7000, 'Tiffin', '/food/food-4.jpg', true, true, false, false, 4.5, 4),

  ('00000000-0000-0000-0000-000000000005',
   'Filter Coffee', 'டிகிரி காபி',
   'Degree decoction pulled tall and frothy in the steel davara-tumbler. The full stop to every Sri Ambika meal.',
   3000, 'Beverages', '/food/food-5.jpg', true, true, false, false, 4.7, 5)
on conflict (id) do update set
  name        = excluded.name,
  tamil_name  = excluded.tamil_name,
  description = excluded.description,
  price_paise = excluded.price_paise,
  category_id = excluded.category_id,
  image_url   = excluded.image_url,
  rating      = excluded.rating,
  sort        = excluded.sort;
