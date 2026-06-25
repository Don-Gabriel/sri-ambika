import { RESTAURANT } from "./data";

/**
 * Canonical, absolute base URL for the public site.
 * Set NEXT_PUBLIC_SITE_URL to your custom domain in production
 * (e.g. https://sriambika.com) — falls back to the Vercel URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sri-ambika-web.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = RESTAURANT.name;

/** Geo-coordinates for Sri Ambika, Pulianthope High Road, Chennai 600012. */
const GEO = { latitude: 13.1015, longitude: 80.2607 };

/**
 * Schema.org Restaurant structured data (JSON-LD).
 * This is the single biggest lever for local search + Google rich results:
 * it tells Google the cuisine, address, hours, price range and rating so the
 * listing can win the local pack and a rich snippet.
 */
export const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: RESTAURANT.name,
  description:
    "Pure-veg South Indian tiffin & dosa house in Pulianthope, Chennai. Crisp dosa, fluffy uttapam, poori channa and degree filter coffee.",
  url: SITE_URL,
  image: `${SITE_URL}/img/og.webp`,
  servesCuisine: ["South Indian", "Tiffin", "Vegetarian", "Dosa"],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  acceptsReservations: "False",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Pulianthope High Road, Kanakaraya Thottam, Pulianthope",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600012",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: GEO.latitude,
    longitude: GEO.longitude,
  },
  hasMap: "https://maps.google.com/?q=Sri+Ambika+Pulianthope+Chennai",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "07:00",
      closes: "22:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: RESTAURANT.rating,
    reviewCount: RESTAURANT.reviewCount,
    bestRating: 5,
    worstRating: 1,
  },
  menu: `${SITE_URL}/menu`,
};
