import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  Choice,
  GlobalContextType,
  Item,
  ListState,
} from "../types/global";

const STORAGE_KEY = "minimize:list";

const emptyList = (): ListState => ({
  id: uuidv4(),
  listName: "",
  description: "",
  items: [],
  decisions: [],
});

function loadSaved(): ListState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ListState>;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.decisions)) {
      return null;
    }
    return { ...emptyList(), ...parsed } as ListState;
  } catch {
    return null;
  }
}

const GlobalContext = React.createContext<GlobalContextType | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ListState>(emptyList);
  const [hydrated, setHydrated] = useState(false);

  // Read the saved list after mount so server and client render the same markup.
  useEffect(() => {
    const saved = loadSaved();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the app still works for this visit.
    }
  }, [state, hydrated]);

  const setListName = useCallback(
    (listName: string) => setState((s) => ({ ...s, listName })),
    []
  );
  const setDescription = useCallback(
    (description: string) => setState((s) => ({ ...s, description })),
    []
  );
  const addItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => ({
      ...s,
      items: [...s.items, { id: uuidv4(), name: trimmed }],
    }));
  }, []);
  const removeItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      items: s.items.filter((item) => item.id !== id),
      decisions: s.decisions.filter((d) => d.id !== id),
    }));
  }, []);
  const decide = useCallback((id: string, choice: Choice) => {
    setState((s) => ({
      ...s,
      // Replace any earlier decision for this item so it is never counted twice.
      decisions: [...s.decisions.filter((d) => d.id !== id), { id, choice }],
    }));
  }, []);
  const undoDecision = useCallback(() => {
    setState((s) => ({ ...s, decisions: s.decisions.slice(0, -1) }));
  }, []);
  const resetDecisions = useCallback(() => {
    setState((s) => ({ ...s, decisions: [] }));
  }, []);
  const startOver = useCallback(() => setState(emptyList()), []);

  const value = useMemo<GlobalContextType>(() => {
    const byId = new Map<string, Item>(state.items.map((i) => [i.id, i]));
    const decided = new Set(state.decisions.map((d) => d.id));
    const pick = (choice: Choice) =>
      state.decisions
        .filter((d) => d.choice === choice)
        .map((d) => byId.get(d.id))
        .filter((i): i is Item => Boolean(i));

    return {
      state,
      hydrated,
      setListName,
      setDescription,
      addItem,
      removeItem,
      decide,
      undoDecision,
      resetDecisions,
      startOver,
      remaining: state.items.filter((i) => !decided.has(i.id)),
      yesList: pick("yes"),
      noList: pick("no"),
    };
  }, [
    state,
    hydrated,
    setListName,
    setDescription,
    addItem,
    removeItem,
    decide,
    undoDecision,
    resetDecisions,
    startOver,
  ]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export function useList(): GlobalContextType {
  const value = useContext(GlobalContext);
  if (!value) throw new Error("useList must be used inside <GlobalProvider>");
  return value;
}
