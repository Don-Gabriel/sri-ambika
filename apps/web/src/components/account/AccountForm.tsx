"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, LogOut, User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";

export default function AccountForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = phone.replace(/\D/g, "");
  const valid =
    name.trim().length > 1 && (phoneDigits.length === 0 || phoneDigits.length === 10);
  const dirty = name !== initialName || phone !== initialPhone;

  const save = async () => {
    if (!valid || saving) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setError("Session expired — please sign in again.");
      setSaving(false);
      return;
    }
    const { error } = await sb
      .from("profiles")
      .update({ full_name: name.trim(), phone: phoneDigits || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const logout = async () => {
    const sb = supabaseBrowser();
    await sb?.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="rounded-3xl glass p-7">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-amber" />
        <h2 className="font-display text-2xl font-bold text-ivory">
          Your details
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="acc-name"
            className="mb-1.5 block font-body text-xs uppercase tracking-wider text-ivory/50"
          >
            Name
          </label>
          <input
            id="acc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl neu-inset px-4 py-3 font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
        </div>
        <div>
          <label
            htmlFor="acc-phone"
            className="mb-1.5 block font-body text-xs uppercase tracking-wider text-ivory/50"
          >
            Mobile number
          </label>
          <input
            id="acc-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="10-digit mobile"
            className="w-full rounded-xl neu-inset px-4 py-3 font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
        </div>
      </div>

      {error && <p className="mt-3 font-body text-sm text-terracotta">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={!valid || !dirty || saving}
          className="flex items-center gap-2 rounded-xl clay px-5 py-3 font-body font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saved ? "Saved" : "Save changes"}
        </button>
        <button
          onClick={logout}
          className="ml-auto flex items-center gap-2 rounded-xl glass-light px-5 py-3 font-body font-semibold text-ivory/80 transition-colors hover:text-ivory"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
