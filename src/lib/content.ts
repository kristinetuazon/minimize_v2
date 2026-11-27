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

/** Which guiding question a card shows: rotates through QUESTIONS by item position. */
export function questionIndex(itemIds: string[], id: string) {
  return Math.max(0, itemIds.indexOf(id)) % QUESTIONS.length;
}

type TipSet = { label: string; keywords: string[]; tips: string[] };

/** Rules of thumb, matched to what's being sorted by the list's name and description. */
export const TIP_SETS: TipSet[] = [
  {
    label: "clothes",
    keywords: ["closet", "clothes", "wardrobe", "shirt", "dress", "shoe", "jeans", "outfit", "coat", "sock"],
    tips: [
      "Not worn in a year? It's probably not coming back.",
      "Does it fit you now, not “one day”?",
      "Would you buy it again today at full price?",
      "Keep the one you reach for first; let the duplicates go.",
    ],
  },
  {
    label: "books",
    keywords: ["book", "shelf", "library", "novel", "magazine", "comic"],
    tips: [
      "Will you really read it again?",
      "Could a library or e-book cover it if you ever want it back?",
      "Keep the ones that changed you; pass on the ones you just finished.",
      "Signed or sentimental? That's a fine reason to keep.",
    ],
  },
  {
    label: "the kitchen",
    keywords: ["kitchen", "drawer", "pantry", "cook", "gadget", "utensil", "mug", "pan", "spice"],
    tips: [
      "Used it in the last six months?",
      "Single-task gadgets earn their space only if you use them often.",
      "Duplicates: keep the best one.",
      "Expired, chipped or broken is an easy let go.",
    ],
  },
  {
    label: "a trip",
    keywords: ["trip", "travel", "pack", "suitcase", "luggage", "carry-on", "weekend", "camping", "holiday", "vacation"],
    tips: [
      "Will you use it at least twice on this trip?",
      "Could you buy it there if you really need it?",
      "Pack for the trip you're taking, not every “what if”.",
      "Wear the bulkiest things on the way.",
    ],
  },
  {
    label: "a move",
    keywords: ["move", "moving", "apartment", "house", "boxes", "flat", "storage"],
    tips: [
      "Is it worth paying to move?",
      "Would you buy it again for the new place?",
      "Will it actually fit the new space?",
      "Sell or donate before the move, not after.",
    ],
  },
];

export const GENERAL_TIPS = [
  "Hesitating for more than five seconds? Swipe up for maybe and keep moving.",
  "Would you buy it again today?",
  "Keep what you use or love, not what you might need someday.",
  "Sentimental things: keep a few favourites and take photos of the rest.",
];

export function tipsFor(text: string): { label: string | null; tips: string[] } {
  const haystack = text.toLowerCase();
  const match = TIP_SETS.find((set) => set.keywords.some((k) => haystack.includes(k)));
  return match ? { label: match.label, tips: match.tips } : { label: null, tips: GENERAL_TIPS };
}

/** Who made Minimize (shown on the About page). */
export const AUTHOR = {
  name: "Kristine",
  portfolio: "https://www.kristinecodes.dev",
  source: "https://github.com/kristinetuazon/minimize_v2",
};
