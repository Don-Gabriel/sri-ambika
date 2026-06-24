import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderClient from "@/components/OrderClient";
import Reveal from "@/components/Reveal";

export default function OrderPage() {
  return (
    <main className="bg-espresso-900">
      <Navbar />

      {/* Hero — order image (otherpics/order.png) */}
      <section className="relative h-[48vh] min-h-[340px] overflow-hidden">
        <Image
          src="/img/order.png"
          alt="Takeaway box with filter coffee"
          fill
          priority
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
          <OrderClient />
        </div>
      </section>

      <Footer />
    </main>
  );
}
