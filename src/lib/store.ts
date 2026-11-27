"use client";

import { useMemo, useSyncExternalStore } from "react";
import { deletePhotos } from "./photos";
import type {
  AppState,
  Choice,
  Destination,
  Item,
  ListState,
  SharedList,
} from "./types";

const STORAGE_KEY = "minimize:list";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const makeList = (id: string, now = Date.now()): ListState => ({
  id,
  listName: "",
  description: "",
  items: [],
  decisions: {},
  history: [],
  outcomes: {},
  createdAt: now,
  updatedAt: now,
});

/** Shown when there's no current list yet. Never mutated. */
const BLANK_LIST: ListState = makeList("", 0);

/** Used on the server and during hydration, so it must never change. */
const SERVER_STATE: AppState = { version: 3, lists: {}, currentId: null, seenIntros: [] };

let state: AppState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

const isBlank = (l: ListState) =>
  l.items.length === 0 && !l.listName.trim() && !l.description.trim();

/* ---------- loading + migration ---------- */

type V1 = {
  id?: string;
  listName?: string;
  description?: string;
  items?: Item[];
  decisions?: { id: string; choice: "yes" | "no" }[];
};
type V2 = { version: 2; list: Omit<ListState, "createdAt" | "updatedAt">; seenIntros?: string[] };

function single(list: ListState, seenIntros: string[] = []): AppState {
  if (isBlank(list)) return { ...SERVER_STATE, seenIntros };
  return { version: 3, lists: { [list.id]: list }, currentId: list.id, seenIntros };
}

/** Reads saved data, upgrading older formats. */
function parse(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<AppState> & Partial<V2> & V1;
    const now = Date.now();

    if (data.version === 3 && data.lists && typeof data.lists === "object") {
      const lists: Record<string, ListState> = {};
      for (const [id, l] of Object.entries(data.lists)) {
        if (l && Array.isArray(l.items)) lists[id] = { ...makeList(id, now), ...l, id };
      }
      const currentId = data.currentId && lists[data.currentId] ? data.currentId : null;
      return { version: 3, lists, currentId, seenIntros: data.seenIntros ?? [] };
    }

    if (data.version === 2 && data.list && Array.isArray(data.list.items)) {
      const id = data.list.id || newId();
      return single({ ...makeList(id, now), ...data.list, id }, data.seenIntros ?? []);
    }

    if (Array.isArray(data.items)) {
      const decisions: Record<string, Choice> = {};
      for (const d of data.decisions ?? []) {
        decisions[d.id] = d.choice === "yes" ? "keep" : "letgo";
      }
      return single({
        ...makeList(data.id || newId(), now),
        listName: data.listName ?? "",
        description: data.description ?? "",
        items: data.items,
        decisions,
      });
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
  const next = fn(state);
  if (next === state) return;
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the app still works for this visit.
  }
  emit();
}

/**
 * Applies a change to the current list, creating it first if there isn't one
 * yet (so a list only exists once something has been typed into it).
 */
const updateList = (fn: (l: ListState) => ListState) =>
  update((s) => {
    const current = (s.currentId && s.lists[s.currentId]) || makeList(newId());
    const changed = fn(current);
    if (changed === current) return s;
    const list = { ...changed, updatedAt: Date.now() };
    return { ...s, currentId: list.id, lists: { ...s.lists, [list.id]: list } };
  });

/** Leaving a list that was never filled in removes it, so it doesn't clutter the lists page. */
function leaveCurrent(s: AppState): AppState {
  const current = s.currentId ? s.lists[s.currentId] : undefined;
  if (!current || !isBlank(current)) return s;
  const lists = { ...s.lists };
  delete lists[current.id];
  return { ...s, lists };
}

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
  /* lists */

  /** Starts a fresh list (created when the person first types into it). */
  newList: () => update((s) => ({ ...leaveCurrent(s), currentId: null })),

  openList: (id: string) =>
    update((s) => (s.lists[id] ? { ...leaveCurrent(s), currentId: id } : s)),

  deleteList: (id: string) => {
    const list = state.lists[id];
    if (!list) return;
    void deletePhotos(list.items.filter((i) => i.photo).map((i) => i.id));
    update((s) => {
      const lists = { ...s.lists };
      delete lists[id];
      return { ...s, lists, currentId: s.currentId === id ? null : s.currentId };
    });
  },

  /** Adds a shared list as a new list and makes it current. Returns its id. */
  importList: (shared: SharedList) => {
    const list: ListState = {
      ...makeList(newId()),
      listName: shared.listName,
      description: shared.description,
      items: shared.items.map((name) => ({ id: newId(), name })),
    };
    update((s) => ({ ...leaveCurrent(s), currentId: list.id, lists: { ...s.lists, [list.id]: list } }));
    return list.id;
  },

  /* current list */

  setListName: (listName: string) => updateList((l) => ({ ...l, listName })),
  setDescription: (description: string) => updateList((l) => ({ ...l, description })),

  addItems: (names: string[]) => {
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (clean.length === 0) return;
    updateList((l) => ({
      ...l,
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
        listName: l.listName || name,
        items: [...l.items, ...fresh.map((n) => ({ id: newId(), name: n }))],
      };
    }),

  removeItem: (id: string) => {
    void deletePhotos([id]);
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
    });
  },

  clearItems: () => {
    const current = state.currentId ? state.lists[state.currentId] : undefined;
    if (current) void deletePhotos(current.items.filter((i) => i.photo).map((i) => i.id));
    updateList((l) => ({ ...l, items: [], decisions: {}, history: [], outcomes: {} }));
  },

  /** Records whether an item has a stored photo (the image itself is in IndexedDB). */
  setItemPhoto: (id: string, photo: boolean) =>
    updateList((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id ? { ...i, photo: photo || undefined } : i)),
    })),

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

  markIntroSeen: (introId: string) =>
    update((s) =>
      s.seenIntros.includes(introId) ? s : { ...s, seenIntros: [...s.seenIntros, introId] }
    ),
};

/* ---------- derived helpers ---------- */

export function summarize(list: ListState) {
  const by = (choice: Choice) => list.items.filter((i) => list.decisions[i.id] === choice);
  const letgo = by("letgo");
  return {
    undecided: list.items.filter((i) => !list.decisions[i.id]),
    keep: by("keep"),
    letgo,
    maybe: by("maybe"),
    handled: letgo.filter((i) => list.outcomes[i.id]?.done).length,
  };
}

/** Where to pick a list back up: sorting if unfinished, otherwise acting. */
export function resumeHref(list: ListState) {
  if (list.items.length === 0) return "/list";
  const sorted = Object.keys(list.decisions).length;
  if (sorted < list.items.length) return "/sort";
  return "/results";
}

/* ---------- hooks ---------- */

export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The current list plus lists derived from it, in the order items were added. */
export function useList() {
  const { lists, currentId } = useAppState();
  const hydrated = useHydrated();
  const list = (currentId && lists[currentId]) || BLANK_LIST;

  return useMemo(
    () => ({ list, hydrated, ...summarize(list), canUndo: list.history.length > 0 }),
    [list, hydrated]
  );
}

/** All saved lists, most recently changed first. */
export function useLists() {
  const { lists, currentId } = useAppState();
  const hydrated = useHydrated();
  return useMemo(
    () => ({
      hydrated,
      currentId,
      lists: Object.values(lists)
        .filter((l) => !isBlank(l))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    }),
    [lists, currentId, hydrated]
  );
}
