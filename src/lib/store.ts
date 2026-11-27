"use client";

import { useMemo, useSyncExternalStore } from "react";
import type {
  AppState,
  Choice,
  Destination,
  Item,
  ListState,
} from "./types";

const STORAGE_KEY = "minimize:list";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyList = (id = ""): ListState => ({
  id,
  listName: "",
  description: "",
  items: [],
  decisions: {},
  history: [],
  outcomes: {},
});

/** Used on the server and during hydration, so it must never change. */
const SERVER_STATE: AppState = { version: 2, list: emptyList(), seenIntros: [] };

let state: AppState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

type V1 = {
  id?: string;
  listName?: string;
  description?: string;
  items?: Item[];
  decisions?: { id: string; choice: "yes" | "no" }[];
};

/** Reads saved data, upgrading the v1 format from before the refresh. */
function parse(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<AppState> & V1;
    if (data.version === 2 && data.list && Array.isArray(data.list.items)) {
      return {
        version: 2,
        list: { ...emptyList(), ...data.list },
        seenIntros: Array.isArray(data.seenIntros) ? data.seenIntros : [],
      };
    }
    if (Array.isArray(data.items)) {
      const decisions: Record<string, Choice> = {};
      for (const d of data.decisions ?? []) {
        decisions[d.id] = d.choice === "yes" ? "keep" : "letgo";
      }
      return {
        version: 2,
        list: {
          ...emptyList(data.id ?? newId()),
          listName: data.listName ?? "",
          description: data.description ?? "",
          items: data.items,
          decisions,
        },
        seenIntros: [],
      };
    }
  } catch {
    // Corrupt data: start fresh.
  }
  return null;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parse(window.localStorage.getItem(STORAGE_KEY)) ?? state;
  } catch {
    // Storage blocked (private mode etc.): keep the in-memory state.
  }
}

function emit() {
  for (const l of listeners) l();
}

function update(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the app still works for this visit.
  }
  emit();
}

const updateList = (fn: (l: ListState) => ListState) =>
  update((s) => ({ ...s, list: fn(s.list) }));

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    state = parse(e.newValue) ?? { ...SERVER_STATE, seenIntros: state.seenIntros };
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => SERVER_STATE;

/* ---------- actions ---------- */

export const actions = {
  setListName: (listName: string) => updateList((l) => ({ ...l, listName })),
  setDescription: (description: string) =>
    updateList((l) => ({ ...l, description })),

  addItems: (names: string[]) => {
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (clean.length === 0) return;
    updateList((l) => ({
      ...l,
      id: l.id || newId(),
      items: [...l.items, ...clean.map((name) => ({ id: newId(), name }))],
    }));
  },

  /** Adds a template's items, skipping ones already on the list. */
  applyTemplate: (name: string, items: string[]) =>
    updateList((l) => {
      const have = new Set(l.items.map((i) => i.name.toLowerCase()));
      const fresh = items.filter((i) => !have.has(i.toLowerCase()));
      return {
        ...l,
        id: l.id || newId(),
        listName: l.listName || name,
        items: [...l.items, ...fresh.map((n) => ({ id: newId(), name: n }))],
      };
    }),

  removeItem: (id: string) =>
    updateList((l) => {
      const decisions = { ...l.decisions };
      const outcomes = { ...l.outcomes };
      delete decisions[id];
      delete outcomes[id];
      return {
        ...l,
        items: l.items.filter((i) => i.id !== id),
        decisions,
        outcomes,
        history: l.history.filter((h) => h.id !== id),
      };
    }),

  clearItems: () =>
    updateList((l) => ({ ...emptyList(l.id), listName: l.listName, description: l.description })),

  decide: (id: string, choice: Choice) =>
    updateList((l) => {
      const prev = l.decisions[id] ?? null;
      if (prev === choice) return l;
      return {
        ...l,
        decisions: { ...l.decisions, [id]: choice },
        history: [...l.history, { id, prev }],
      };
    }),

  undo: () =>
    updateList((l) => {
      const last = l.history[l.history.length - 1];
      if (!last) return l;
      const decisions = { ...l.decisions };
      if (last.prev) decisions[last.id] = last.prev;
      else delete decisions[last.id];
      return { ...l, decisions, history: l.history.slice(0, -1) };
    }),

  resetDecisions: () =>
    updateList((l) => ({ ...l, decisions: {}, history: [], outcomes: {} })),

  setDestination: (id: string, destination: Destination | undefined) =>
    updateList((l) => ({
      ...l,
      outcomes: { ...l.outcomes, [id]: { ...l.outcomes[id], destination } },
    })),

  toggleDone: (id: string) =>
    updateList((l) => ({
      ...l,
      outcomes: {
        ...l.outcomes,
        [id]: { ...l.outcomes[id], done: !l.outcomes[id]?.done },
      },
    })),

  startOver: () => update((s) => ({ ...s, list: emptyList(newId()) })),

  markIntroSeen: (introId: string) =>
    update((s) =>
      s.seenIntros.includes(introId)
        ? s
        : { ...s, seenIntros: [...s.seenIntros, introId] }
    ),
};

/* ---------- hooks ---------- */

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The current list plus lists derived from it, in the order items were added. */
export function useList() {
  const { list } = useAppState();
  const hydrated = useHydrated();

  return useMemo(() => {
    const by = (choice: Choice) =>
      list.items.filter((i) => list.decisions[i.id] === choice);
    return {
      list,
      hydrated,
      undecided: list.items.filter((i) => !list.decisions[i.id]),
      keep: by("keep"),
      letgo: by("letgo"),
      maybe: by("maybe"),
      canUndo: list.history.length > 0,
    };
  }, [list, hydrated]);
}
