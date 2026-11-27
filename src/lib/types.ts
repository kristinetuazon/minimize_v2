export type Item = {
  id: string;
  name: string;
  /** True when a photo for this item is stored in IndexedDB (keyed by item id). */
  photo?: boolean;
};

export type Choice = "keep" | "letgo" | "maybe";

export type Destination = "donate" | "sell" | "gift" | "recycle" | "trash";

/** What the person plans to do with a let-go item, and whether it's done. */
export type Outcome = {
  destination?: Destination;
  done?: boolean;
};

export type HistoryEntry = {
  id: string;
  /** The item's decision before this change, or null if it had none. */
  prev: Choice | null;
};

export type ListState = {
  id: string;
  listName: string;
  description: string;
  items: Item[];
  decisions: Record<string, Choice>;
  /** Every decision change, newest last, so undo can step back. */
  history: HistoryEntry[];
  outcomes: Record<string, Outcome>;
  createdAt: number;
  updatedAt: number;
};

/** Everything saved to localStorage. Photos live in IndexedDB. */
export type AppState = {
  version: 3;
  lists: Record<string, ListState>;
  /** The list the List / Sort / Act pages work on, or null for a new one. */
  currentId: string | null;
  /** Intro panels the person has already read. */
  seenIntros: string[];
};

/** What a share link carries: the list itself, never decisions or photos. */
export type SharedList = {
  listName: string;
  description: string;
  items: string[];
};
