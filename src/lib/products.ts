export const categories = [
  "All products",
  "Everyday bags",
  "Home & living",
  "Accessories",
] as const;
export type Category = (typeof categories)[number];
export type Product = {
  id: string;
  name: string;
  category: Exclude<Category, "All products">;
  price: number;
  color: string;
  shape: "tote" | "basket" | "pouch" | "round";
  description: string;
  dimensions: string;
};

// Sample catalog. Replace this module with a server-side repository when the admin is built.
export const products: Product[] = [
  {
    id: "everyday-jute-tote",
    name: "The everyday tote",
    category: "Everyday bags",
    price: 850,
    color: "#bba078",
    shape: "tote",
    description:
      "A simple, roomy companion for market mornings and everything that follows. Natural jute, comfortable handles, and space for your daily essentials.",
    dimensions: "38 × 34 × 12 cm",
  },
  {
    id: "woven-storage-basket",
    name: "The woven basket",
    category: "Home & living",
    price: 1250,
    color: "#c4a478",
    shape: "basket",
    description:
      "A little order, a lot of warmth. A woven basket for the blankets, plants, and small things that make a house your home.",
    dimensions: "28 × 28 × 26 cm",
  },
  {
    id: "little-jute-pouch",
    name: "The little pouch",
    category: "Accessories",
    price: 450,
    color: "#b8aa8d",
    shape: "pouch",
    description:
      "Keep the little things together. A compact jute pouch for your keys, everyday essentials, or a thoughtfully chosen gift.",
    dimensions: "22 × 16 × 5 cm",
  },
  {
    id: "weekend-jute-bag",
    name: "The weekend bag",
    category: "Everyday bags",
    price: 1450,
    color: "#ac8b66",
    shape: "round",
    description:
      "Made for slower days and spontaneous plans. A relaxed, rounded carryall with a generous interior and natural woven texture.",
    dimensions: "40 × 36 × 14 cm",
  },
];
export const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;
