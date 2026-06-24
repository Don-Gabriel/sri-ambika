import type { Metadata } from "next";
import { Playfair_Display, Karla } from "next/font/google";
import "./globals.css";
import StoreHydrator from "@/components/StoreHydrator";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sri Ambika · Chennai's Tiffin Temple",
  description:
    "A pure-veg South Indian tiffin & dosa house in Pulianthope, Chennai. Order crisp dosa, fluffy uttapam, poori channa and degree filter coffee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${karla.variable}`}>
      <body className="font-body antialiased">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
