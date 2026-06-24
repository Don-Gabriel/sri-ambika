import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/** Magic-link / OAuth landing: exchange the ?code for a session, then redirect. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only allow same-origin internal paths (single leading slash) — blocks
  // open-redirect via ?next=//evil.com or ?next=https://evil.com.
  const raw = searchParams.get("next") ?? "/account";
  const next = /^\/(?!\/)/.test(raw) ? raw : "/account";

  if (code) {
    const supabase = supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
