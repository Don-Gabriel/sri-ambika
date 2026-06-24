"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "@sriambika/db";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Browser Supabase client with cookie-based session persistence (@supabase/ssr).
 * Used for menu reads, placing orders, and auth. null if env unset.
 */
export function supabaseBrowser(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // distinct cookie name so the customer + admin apps don't share a session
      // (both run on localhost, where cookies aren't isolated by port)
      { auth: { storageKey: "sb-sriambika-web" } }
    );
  }
  return _client;
}
