export type Item = {
  id: string;
  name: string;
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
};

/** Everything saved to localStorage. */
export type AppState = {
  version: 2;
  list: ListState;
  /** Intro panels the person has already read. Survives "start a new list". */
  seenIntros: string[];
};
