export type Item = {
  id: string;
  name: string;
};

export type Choice = "yes" | "no";

export type Decision = {
  id: string;
  choice: Choice;
};

/** Everything that gets saved to localStorage. */
export type ListState = {
  id: string;
  listName: string;
  description: string;
  items: Item[];
  /** Sort decisions in the order they were made (so the last one can be undone). */
  decisions: Decision[];
};

export type GlobalContextType = {
  state: ListState;
  /** False until the saved list has been read from localStorage. */
  hydrated: boolean;
  setListName: (value: string) => void;
  setDescription: (value: string) => void;
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
  decide: (id: string, choice: Choice) => void;
  undoDecision: () => void;
  resetDecisions: () => void;
  startOver: () => void;
  /** Items not yet sorted, in list order. */
  remaining: Item[];
  yesList: Item[];
  noList: Item[];
};
