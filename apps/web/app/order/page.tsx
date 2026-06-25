import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderClient from "@/components/OrderClient";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Order Online for Pickup",
  description:
    "Review your box and order Sri Ambika tiffin online for pickup in Pulianthope, Chennai. Pay online or on collection — no account needed to order.",
  alternates: { canonical: "/order" },
  openGraph: {
    title: "Order Online for Pickup · Sri Ambika",
    description:
      "Order pure-veg South Indian tiffin for pickup in Pulianthope, Chennai. Pay online or on collection.",
    url: "/order",
  },
};

export default function OrderPage() {
  return (
    <main className="bg-espresso-900">
      <Navbar />

      {/* Hero — order image (otherpics/order.png) */}
      <section className="relative h-[48vh] min-h-[340px] overflow-hidden">
        <Image
          src="/img/order.webp"
          alt="Takeaway box with filter coffee"
          fill
          priority
          sizes="100vw"
          className="object-cover duotone-warm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/60 via-espresso-900/40 to-espresso-900" />
        <div className="grain absolute inset-0" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
              Checkout
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-3 font-display text-5xl font-black text-ivory md:text-7xl">
              Your <span className="text-gold-grad">Box</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-16">
        <div className="absolute inset-0 bg-aurora opacity-15" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-ivory md:text-4xl">
              Pickup from <span className="text-gold-grad">Pulianthope</span>
            </h2>
            <p className="mt-4 font-body text-ivory/60">
              Check over your box below, then place the order for pickup at Sri
              Ambika on Pulianthope High Road, Chennai. You can pay online or
              settle on collection, and you don&apos;t need an account — sign in
              only if you&apos;d like to save your details and reorder your
              favourites later. We&apos;ll have your tiffin hot and ready at the
              counter.
            </p>
          </Reveal>
          <OrderClient />
        </div>
      </section>

      <Footer />
    </main>
  );
}
