import type { OrderRow, OrderItemRow, MenuItemRow, CategoryRow } from "@sriambika/db";

export type MenuRow = MenuItemRow;
export type CategoryItem = CategoryRow;

export type OrderWithItems = OrderRow & {
  order_items: OrderItemRow[];
  profiles?: { full_name: string | null; phone: string | null } | null;
};

export const ACTIVE_STATUSES = ["new", "preparing", "ready"];
export const HISTORY_STATUSES = ["completed", "cancelled"];

