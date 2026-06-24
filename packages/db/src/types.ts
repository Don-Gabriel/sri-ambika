// Database row types — mirror the SQL schema in supabase/migrations.
// Money is stored as integer PAISE everywhere in the DB to avoid float errors.

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type Fulfilment = "takeaway" | "dine_in";
export type PaymentMethod = "cash" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type Role = "customer" | "owner";

export interface CategoryRow {
  id: string;
  name: string;
  sort: number;
}

export interface MenuItemRow {
  id: string;
  name: string;
  tamil_name: string | null;
  description: string | null;
  price_paise: number;
  category_id: string | null;
  image_url: string | null;
  available: boolean;
  is_veg: boolean;
  spicy: boolean;
  bestseller: boolean;
  rating: number | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  code: string;
  user_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  fulfilment: Fulfilment;
  pickup_at: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal_paise: number;
  tax_paise: number;
  total_paise: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price_paise: number;
  qty: number;
}

/** App-facing menu item (rupees, camelCase) — what the UI consumes. */
export interface MenuItem {
  id: string;
  name: string;
  tamilName?: string;
  description: string;
  price: number; // rupees
  category: string;
  image: string;
  available: boolean;
  veg: boolean;
  spicy?: boolean;
  bestseller?: boolean;
  rating?: number;
}
