import { SupabaseClient } from "@supabase/supabase-js";
import { MenuItem, MenuItemRow } from "./types";
import { paiseToRupees } from "./money";

export function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    tamilName: row.tamil_name ?? undefined,
    description: row.description ?? "",
    price: paiseToRupees(row.price_paise),
    category: row.category_id ?? "Tiffin",
    image: row.image_url ?? "",
    available: row.available,
    veg: row.is_veg,
    spicy: row.spicy || undefined,
    bestseller: row.bestseller || undefined,
    rating: row.rating ?? undefined,
  };
}

/** Public, RLS-protected read of the live menu (ordered). */
export async function fetchMenu(client: SupabaseClient): Promise<MenuItem[]> {
  const { data, error } = await client
    .from("menu_items")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as MenuItemRow[]).map(mapMenuItem);
}
