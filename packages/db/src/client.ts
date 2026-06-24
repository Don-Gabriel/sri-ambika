import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous (public) client — safe for the browser and for server reads.
 * Uses the publishable / anon key, which is gated by Row-Level Security.
 */
export function createAnonClient(url?: string, anonKey?: string): SupabaseClient {
  const u = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !k) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(u, k, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when public Supabase env is configured (used for graceful fallback). */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Service-role client — bypasses RLS. SERVER-ONLY. NEVER import this into any
 * client component or the customer (`apps/web`) bundle. Only privileged
 * server tasks in the admin app / trusted server actions may use it.
 */
export function createServiceClient(url?: string, serviceKey?: string): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() must never run in the browser.");
  }
  const u = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = serviceKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!u || !k) {
    throw new Error(
      "Service env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(u, k, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
