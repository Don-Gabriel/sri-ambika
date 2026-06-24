import { z } from "zod";

// Validation schemas — used on EVERY server boundary (OWASP: never trust client input).

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number");

export const cartLineSchema = z.object({
  menu_item_id: z.string().uuid(),
  qty: z.number().int().min(1).max(50),
});

export const placeOrderSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(40),
  fulfilment: z.enum(["takeaway", "dine_in"]),
  payment_method: z.enum(["cash", "online"]),
  guest_name: z.string().trim().min(2).max(80).optional(),
  guest_phone: phoneSchema.optional(),
  notes: z.string().trim().max(300).optional(),
  pickup_at: z.string().datetime().optional(),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const upsertMenuItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  tamil_name: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(400).optional().nullable(),
  price_paise: z.number().int().min(0).max(10_000_00),
  category_id: z.string().trim().min(1).max(40).nullable(),
  image_url: z.string().trim().max(2000).optional().nullable(),
  available: z.boolean(),
  is_veg: z.boolean().default(true),
  spicy: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional().nullable(),
});
export type UpsertMenuItemInput = z.infer<typeof upsertMenuItemSchema>;

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
});
