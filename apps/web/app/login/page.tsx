"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const sb = supabaseBrowser();
    if (!sb) {
      setError("Sign-in isn't configured yet.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // on success the browser redirects to Google
  };

  return (
    <main className="min-h-screen bg-espresso-900">
      <Navbar />
      <div className="relative grid min-h-screen place-items-center px-6">
        <div className="absolute inset-0 bg-aurora opacity-20" />
        <div className="relative w-full max-w-md rounded-3xl glass p-8 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl clay-gold font-display text-2xl font-black text-espresso-900">
            S
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold text-ivory">
            Sign in
          </h1>
          <p className="mt-2 font-body text-ivory/60">
            One tap with Google to save your details, track orders and reorder
            your favourites.
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-body font-semibold text-[#1f1f1f] shadow-lg transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {error && (
            <p className="mt-4 font-body text-sm text-terracotta">{error}</p>
          )}

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-body text-xs uppercase tracking-wider text-ivory/40">
              or
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            href="/menu"
            className="block w-full rounded-2xl glass-light px-6 py-3.5 font-body font-semibold text-ivory transition-colors hover:bg-white/15"
          >
            Order as a guest
          </Link>
          <p className="mt-4 font-body text-xs text-ivory/40">
            No account needed to order — sign in only to keep your history.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 46c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 41.6 16.3 46 24 46z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5c-.5.4 7.3-5 7.3-15 0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
