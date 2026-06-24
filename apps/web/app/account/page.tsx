import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountForm from "@/components/account/AccountForm";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-espresso-900">
      <Navbar />
      <section className="relative px-6 pb-24 pt-32">
        <div className="absolute inset-0 bg-aurora opacity-10" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
            Your account
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-ivory md:text-5xl">
            Welcome back
          </h1>
          <p className="mt-2 font-body text-ivory/55">{user.email}</p>

          <div className="mt-8">
            <AccountForm
              initialName={profile?.full_name ?? ""}
              initialPhone={profile?.phone ?? ""}
            />
          </div>

          <Link
            href="/account/orders"
            className="group mt-6 flex items-center justify-between rounded-2xl glass p-6 transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-3">
              <Receipt className="h-6 w-6 text-amber" />
              <span>
                <span className="block font-display text-lg font-bold text-ivory">
                  Order history
                </span>
                <span className="font-body text-sm text-ivory/55">
                  View past orders &amp; reorder in one tap
                </span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-ivory/50 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
