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
  /** Let-go item: it's gone. */
  done?: boolean;
  /** Kept item in checklist mode: packed / put away. */
  packed?: boolean;
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
  /** Keep-only-N mode: the most items the person can keep. */
  keepLimit?: number;
  /** Show the Keep list as a packing checklist. */
  checklist?: boolean;
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
  /** Totals from deleted lists, so lifetime stats survive deleting. */
  archive?: ArchivedStats;
  /** Highest balloon altitude level already celebrated. */
  seenAltitude?: number;
  /** Completed lists moved out of the way. Kept (without photos) so they can be restored. */
  archived?: Record<string, ArchivedList>;
  autoArchive?: AutoArchive;
  /** When the last backup file was downloaded. */
  lastBackupAt?: number;
};

export type ArchivedList = ListState & { archivedAt: number };

/** off · archive completed lists 30 days after they were finished · keep at most 8 lists in the sky */
export type AutoArchive = "off" | "30d" | "full";

/** A finished list, remembered as a travel poster on the Progress page. */
export type Postcard = {
  id: string;
  name: string;
  letgo: number;
  kept: number;
  date: number;
};

export type ArchivedStats = {
  lists: number;
  /** Deleted lists that had been fully sorted (no unsorted items or maybes). */
  finished?: number;
  kept: number;
  letgo: number;
  gone: number;
  byDestination: Partial<Record<Destination, number>>;
  /** Posters for deleted lists that had been finished. */
  postcards?: Postcard[];
};

/** What a share link carries: the list itself, never decisions or photos. */
export type SharedList = {
  listName: string;
  description: string;
  items: string[];
};
