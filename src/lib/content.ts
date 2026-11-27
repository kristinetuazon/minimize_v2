import type { Destination } from "./types";

export const TEMPLATES: { name: string; items: string[] }[] = [
  {
    name: "Closet",
    items: ["Jeans", "Winter coat", "Graphic tees", "Sneakers", "Dress shoes", "Scarves", "Old hoodies", "Formal wear"],
  },
  {
    name: "Kitchen drawer",
    items: ["Takeout chopsticks", "Spare batteries", "Rubber bands", "Birthday candles", "Mystery keys", "Soy sauce packets", "Twist ties", "Takeout menus"],
  },
  {
    name: "Weekend trip",
    items: ["Toiletry bag", "Phone charger", "Book", "Laptop", "Extra shoes", "Rain jacket", "Snacks", "Camera"],
  },
  {
    name: "Bookshelf",
    items: ["Read-once novels", "Old textbooks", "Cookbooks", "Magazines", "Travel guides", "Gifted books"],
  },
  {
    name: "Moving",
    items: ["Spare furniture", "Old electronics", "Decor", "Kitchen gadgets", "Linens", "Hobby supplies", "Paperwork", "Plants"],
  },
];

/** Shown one per card while sorting. */
export const QUESTIONS = [
  "Have I used this in the last year?",
  "Is it in good condition and working?",
  "Do I have space to store it?",
  "Does it serve a purpose in my life?",
  "Do I already have something similar?",
  "Does it give me joy?",
];

export const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: "donate", label: "🎁 Donate" },
  { value: "sell", label: "🏷️ Sell" },
  { value: "gift", label: "💌 Give to someone" },
  { value: "recycle", label: "♻️ Recycle" },
  { value: "trash", label: "🗑️ Throw away" },
];

/** Splits pasted text into item names (one per line, or comma/semicolon separated). */
export function splitItems(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}
