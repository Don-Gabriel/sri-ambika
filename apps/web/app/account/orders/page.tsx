import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrdersList from "@/components/account/OrdersList";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await sb
    .from("orders")
    .select(
      "id, code, status, fulfilment, payment_method, payment_status, total_paise, created_at, order_items(menu_item_id, name, price_paise, qty)"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-espresso-900">
      <Navbar />
      <section className="relative px-6 pb-24 pt-32">
        <div className="absolute inset-0 bg-aurora opacity-10" />
        <div className="relative mx-auto max-w-3xl">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 font-body text-sm text-ivory/55 transition-colors hover:text-ivory"
          >
            <ArrowLeft className="h-4 w-4" /> Account
          </Link>
          <h1 className="mt-3 font-display text-4xl font-bold text-ivory md:text-5xl">
            Order <span className="text-gold-grad">history</span>
          </h1>

          <div className="mt-8">
            <OrdersList initialOrders={orders ?? []} userId={user.id} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
