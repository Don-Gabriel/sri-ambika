import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import Dashboard from "@/components/Dashboard";
import NotOwner from "@/components/NotOwner";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return <NotOwner email={user.email ?? ""} />;
  }

  const [{ data: orders }, { data: menu }, { data: categories }] = await Promise.all([
    sb
      .from("orders")
      .select("*, order_items(*), profiles(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(500),
    sb.from("menu_items").select("*").order("sort"),
    sb.from("categories").select("*").order("sort"),
  ]);

  return (
    <Dashboard
      initialOrders={orders ?? []}
      initialMenu={menu ?? []}
      initialCategories={categories ?? []}
      ownerName={profile.full_name ?? "Owner"}
    />
  );
}
