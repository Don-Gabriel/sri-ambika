import { MenuItem, Review } from "./types";

export const RESTAURANT = {
  name: "Sri Ambika",
  tagline: "Chennai's tiffin temple since the morning rush",
  rating: 3.8,
  reviewCount: 62,
  price: "₹1–200",
  address:
    "37X7+J5G, Pulianthope High Road, Kanakaraya Thottam, Pulianthope, Chennai, Tamil Nadu 600012",
  hours: "Open daily · Closes 10:00 PM",
  cuisine: "Pure-Veg · South Indian · Tiffin & Dosa",
};

/** 5 seed items mapped to the supplied food photos (otherpics/food). */
export const SEED_MENU: MenuItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Sri Ambika Special Box",
    tamilName: "ஸ்பெஷல் பாக்ஸ்",
    description:
      "Our signature loaded box — crisp fritters, golden fries and house chutney. The crowd-puller on every table.",
    price: 180,
    category: "Combos",
    image: "/food/food-1.jpg",
    available: true,
    veg: true,
    bestseller: true,
    rating: 4.6,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Masala Dosa",
    tamilName: "மசாலா தோசை",
    description:
      "Stone-ground batter fermented overnight, ribboned thin on the griddle, wrapped around spiced potato masala.",
    price: 90,
    category: "Dosa",
    image: "/food/food-2.jpg",
    available: true,
    veg: true,
    spicy: true,
    bestseller: true,
    rating: 4.4,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Onion Uttapam",
    tamilName: "வெங்காய ஊத்தப்பம்",
    description:
      "Thick, fluffy and griddle-kissed with sweet onions — exactly the breakfast the RTO regulars swear by.",
    price: 80,
    category: "Tiffin",
    image: "/food/food-3.jpg",
    available: true,
    veg: true,
    rating: 4.2,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Poori Channa",
    tamilName: "பூரி சென்னா",
    description:
      "Puffed golden pooris with slow-cooked channa masala. 'Superb' — and the regulars are rarely wrong.",
    price: 70,
    category: "Tiffin",
    image: "/food/food-4.jpg",
    available: true,
    veg: true,
    rating: 4.5,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Filter Coffee",
    tamilName: "டிகிரி காபி",
    description:
      "Degree decoction pulled tall and frothy in the steel davara-tumbler. The full stop to every Sri Ambika meal.",
    price: 30,
    category: "Beverages",
    image: "/food/food-5.jpg",
    available: true,
    veg: true,
    rating: 4.7,
  },
];

/** Real Google reviews supplied for the business. */
export const REVIEWS: Review[] = [
  {
    name: "Fiiz 619",
    meta: "Local Guide · 229 reviews",
    when: "3 years ago",
    text: "Tried onion uttapam and coffee, was very decent. If you are visiting Pulianthope RTO then this is your place for nice breakfast.",
    stars: 4,
  },
  {
    name: "Shravanya Pothala",
    meta: "Local Guide · 11 reviews",
    when: "2 years ago",
    text: "It's one of the best places for Tamil Nadu tiffin items from my childhood. Must try.",
    stars: 5,
  },
  {
    name: "Ram Kumar (Raam)",
    meta: "Local Guide · 34 reviews",
    when: "3 years ago",
    text: "Nice place, has veg breakfast. Superb — specially poori channa.",
    stars: 5,
  },
  {
    name: "Praveen B",
    meta: "13 reviews",
    when: "3 years ago",
    text: "Good service. Good quality foods. Best taste and price low.",
    stars: 5,
  },
  {
    name: "Sree Sree",
    meta: "Local Guide · 22 reviews",
    when: "2 years ago",
    text: "Tasty food and nice ambiance. Service was good.",
    stars: 5,
  },
  {
    name: "arun kumar",
    meta: "Local Guide · 10 reviews",
    when: "4 years ago",
    text: "Very neat & clean. Food taste was good.",
    stars: 5,
  },
  {
    name: "Mahendra Kumar",
    meta: "Local Guide · 50 reviews",
    when: "4 years ago",
    text: "Good taste food and very good service.",
    stars: 4,
  },
];

export const ADMIN_PIN = "1234";
export const TAX_RATE = 0.05;
