export type Category = "Dosa" | "Tiffin" | "Beverages" | "Chaat" | "Combos";

export interface MenuItem {
  id: string;
  name: string;
  tamilName?: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  available: boolean;
  veg: boolean;
  spicy?: boolean;
  bestseller?: boolean;
  rating?: number;
}

export interface CartLine {
  id: string;
  qty: number;
}

export type OrderStatus = "new" | "preparing" | "ready" | "completed";

export interface Order {
  id: string;
  createdAt: number;
  customer: { name: string; phone: string; type: "Dine-in" | "Takeaway" };
  lines: { id: string; name: string; price: number; qty: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paid: boolean;
}

export interface Review {
  name: string;
  meta: string;
  when: string;
  text: string;
  stars: number;
}
