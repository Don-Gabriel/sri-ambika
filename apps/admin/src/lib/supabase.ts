"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "@sriambika/db";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // distinct cookie name so admin + customer apps don't share a session on localhost
      { auth: { storageKey: "sb-sriambika-admin" } }
    );
  }
  return _client;
}
