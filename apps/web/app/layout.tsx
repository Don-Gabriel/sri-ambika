import type { Metadata } from "next";
import { Playfair_Display, Karla } from "next/font/google";
import "./globals.css";
import StoreHydrator from "@/components/StoreHydrator";
import { SITE_URL, SITE_NAME, restaurantJsonLd } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sri Ambika · Chennai's Tiffin Temple in Pulianthope",
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A pure-veg South Indian tiffin & dosa house in Pulianthope, Chennai. Order crisp dosa, fluffy uttapam, poori channa and degree filter coffee.",
  applicationName: SITE_NAME,
  keywords: [
    "Sri Ambika",
    "tiffin Pulianthope",
    "dosa Chennai",
    "South Indian breakfast Chennai",
    "pure veg restaurant Pulianthope",
    "filter coffee Chennai",
    "vegetarian tiffin near me",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: "Sri Ambika · Chennai's Tiffin Temple in Pulianthope",
    description:
      "Pure-veg South Indian tiffin & dosa house in Pulianthope, Chennai. Crisp dosa, fluffy uttapam, poori channa and degree filter coffee.",
    images: [
      {
        url: "/img/og.webp",
        width: 1200,
        height: 630,
        alt: "Crisp ghee-roast dosa with chutney at Sri Ambika",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sri Ambika · Chennai's Tiffin Temple in Pulianthope",
    description:
      "Pure-veg South Indian tiffin & dosa house in Pulianthope, Chennai. Crisp dosa, fluffy uttapam, poori channa and degree filter coffee.",
    images: ["/img/og.webp"],
  },
  category: "restaurant",
  verification: {
    google: "5oj9hHV-Kkpxi0wUUH0GEk6NeaRdTC2c-eleBzzMYsk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${karla.variable}`}>
      <body className="font-body antialiased">
        {/* Restaurant structured data — powers the local pack + rich snippet */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
