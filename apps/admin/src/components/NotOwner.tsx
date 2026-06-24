"use client";

import { ShieldAlert, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function NotOwner({ email }: { email: string }) {
  const logout = async () => {
    await supabaseBrowser()?.auth.signOut();
    location.href = "/login";
  };
  return (
    <main className="grid min-h-screen place-items-center bg-espresso-900 px-6">
      <div className="w-full max-w-md rounded-3xl glass p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-terracotta/15">
          <ShieldAlert className="h-8 w-8 text-terracotta" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ivory">
          Not authorized
        </h1>
        <p className="mt-2 font-body text-sm text-ivory/60">
          <span className="text-amber-glow">{email}</span> isn&apos;t an owner
          account. This console is restricted.
        </p>
        <button
          onClick={logout}
          className="mt-6 inline-flex items-center gap-2 rounded-xl neu px-5 py-3 font-body font-semibold text-ivory/80 transition-colors hover:text-ivory"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </main>
  );
}
