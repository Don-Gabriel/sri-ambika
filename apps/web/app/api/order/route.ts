import { NextResponse } from "next/server";
import { createServiceClient, placeOrderSchema } from "@sriambika/db";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * The ONLY way an order is created. Verifies the Cloudflare Turnstile token,
 * then places the order via the service-role client (the only role allowed to
 * call place_order). The user id comes from the verified server session, never
 * the client — so logged-in orders link correctly and bots can't bypass.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { turnstileToken, ...order } = (body ?? {}) as Record<string, unknown>;

  // 1) validate the order shape (defence in depth — the DB validates too)
  const parsed = placeOrderSchema.safeParse(order);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  // 2) verify the Turnstile token with Cloudflare
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Ordering is temporarily unavailable." }, { status: 503 });
  }
  if (typeof turnstileToken !== "string" || !turnstileToken) {
    return NextResponse.json({ error: "Please complete the verification." }, { status: 403 });
  }
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const form = new URLSearchParams({ secret, response: turnstileToken });
  if (ip) form.set("remoteip", ip);

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const verify = (await verifyRes.json()) as { success: boolean };
  if (!verify.success) {
    return NextResponse.json(
      { error: "Verification failed — please try again." },
      { status: 403 }
    );
  }

  // 3) who is ordering? trust the server session, not the client
  const {
    data: { user },
  } = await supabaseServer().auth.getUser();

  // 4) place the order via the locked-down RPC (service role)
  let svc;
  try {
    svc = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Ordering is temporarily unavailable." }, { status: 503 });
  }

  const { data, error } = await svc.rpc("place_order", {
    p_items: parsed.data.items,
    p_fulfilment: parsed.data.fulfilment,
    p_payment_method: parsed.data.payment_method,
    p_guest_name: parsed.data.guest_name ?? "",
    p_guest_phone: parsed.data.guest_phone ?? "",
    p_user_id: user?.id ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message.replace(/^.*?:\s*/, "") || "Could not place the order." },
      { status: 400 }
    );
  }
  return NextResponse.json(data);
}
