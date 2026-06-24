"use client";

import { useState } from "react";
import { Lock, Loader2, User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    if (!username.trim() || !password || loading) return;
    const sb = supabaseBrowser();
    if (!sb) {
      setError("Not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    const email = `${username.trim().toLowerCase()}@sriambika.local`;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Wrong username or password.");
      setLoading(false);
      return;
    }
    // full reload so the server picks up the session cookie + owner gate
    window.location.href = "/";
  };

  return (
    <main className="relative grid min-h-screen place-items-center bg-espresso-900 px-6">
      <div className="absolute inset-0 bg-aurora opacity-20" />
      <div className="relative w-full max-w-sm rounded-3xl glass p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl neu">
          <Lock className="h-6 w-6 text-amber" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ivory">
          Owner sign-in
        </h1>
        <p className="mt-2 font-body text-sm text-ivory/55">
          Restricted to the restaurant owner.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 rounded-xl neu-inset px-4">
            <User className="h-4 w-4 text-ivory/40" />
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Username"
              autoComplete="username"
              className="w-full bg-transparent py-3.5 font-body text-ivory placeholder:text-ivory/30 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl neu-inset px-4">
            <Lock className="h-4 w-4 text-ivory/40" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-transparent py-3.5 font-body text-ivory placeholder:text-ivory/30 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-3 font-body text-sm text-terracotta">{error}</p>}

        <button
          onClick={signIn}
          disabled={!username.trim() || !password || loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl clay px-6 py-3.5 font-body font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
        </button>
      </div>
    </main>
  );
}
