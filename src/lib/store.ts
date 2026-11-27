"use client";

import { useMemo, useSyncExternalStore } from "react";
import { deletePhotos } from "./photos";
import type {
  AppState,
  ArchivedList,
  ArchivedStats,
  AutoArchive,
  Choice,
  Destination,
  Item,
  ListState,
  Postcard,
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
export function parse(raw: string | null): AppState | null {
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
      return {
        version: 3,
        lists,
        currentId,
        seenIntros: data.seenIntros ?? [],
        archive: data.archive,
        seenAltitude: data.seenAltitude,
        archived: data.archived,
        autoArchive: data.autoArchive,
        lastBackupAt: data.lastBackupAt,
      };
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

/** True once a save has failed (storage full or blocked). */
let storageFull = false;
const storageListeners = new Set<() => void>();
export function reportStorageFull(full: boolean) {
  if (storageFull === full) return;
  storageFull = full;
  storageListeners.forEach((l) => l());
}
export function useStorageFull() {
  return useSyncExternalStore(
    (cb) => {
      storageListeners.add(cb);
      return () => storageListeners.delete(cb);
    },
    () => storageFull,
    () => false
  );
}

function update(fn: (s: AppState) => AppState) {
  load();
  const next = fn(state);
  if (next === state) return;
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    reportStorageFull(false);
  } catch {
    // Storage full or blocked: the app still works for this visit, and we say so.
    reportStorageFull(true);
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

/** Applies a change to a specific list (used by undo, which may run after switching lists). */
const updateListById = (id: string, fn: (l: ListState) => ListState) =>
  update((s) => {
    const list = s.lists[id];
    if (!list) return s;
    return { ...s, lists: { ...s.lists, [id]: { ...fn(list), updatedAt: Date.now() } } };
  });

/** How many balloons the Your lists sky shows; "full" auto-archive keeps to this. */
export const FLEET_MAX = 8;

function moveToArchive(s: AppState, ids: string[]): AppState {
  const lists = { ...s.lists };
  const archived: Record<string, ArchivedList> = { ...s.archived };
  const now = Date.now();
  for (const id of ids) {
    const list = lists[id];
    if (!list) continue;
    delete lists[id];
    // Photos are removed to free space; history isn't needed any more.
    archived[id] = {
      ...list,
      items: list.items.map(({ photo: _photo, ...item }) => (void _photo, item)),
      history: [],
      archivedAt: now,
    };
  }
  return { ...s, lists, archived, currentId: s.currentId && ids.includes(s.currentId) ? null : s.currentId };
}

function postcardFor(list: ListState): Postcard {
  const { keep, letgo } = summarize(list);
  return { id: list.id, name: list.listName || "Untitled list", letgo: letgo.length, kept: keep.length, date: list.updatedAt };
}

function addToArchive(archive: ArchivedStats | undefined, list: ListState): ArchivedStats {
  const a = archive ?? { lists: 0, kept: 0, letgo: 0, gone: 0, byDestination: {} };
  const { keep, letgo, handled, undecided, maybe } = summarize(list);
  const wasFinished = list.items.length > 0 && undecided.length === 0 && maybe.length === 0;
  const byDestination = { ...a.byDestination };
  for (const item of letgo) {
    const o = list.outcomes[item.id];
    if (o?.done && o.destination) byDestination[o.destination] = (byDestination[o.destination] ?? 0) + 1;
  }
  return {
    lists: a.lists + 1,
    finished: (a.finished ?? 0) + (wasFinished ? 1 : 0),
    postcards: wasFinished ? [...(a.postcards ?? []), postcardFor(list)] : a.postcards,
    kept: a.kept + keep.length,
    letgo: a.letgo + letgo.length,
    gone: a.gone + handled,
    byDestination,
  };
}

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

  /**
   * Removes a list. Returns `undo` (puts it back) and `commit` (deletes its
   * photos and folds its totals into lifetime stats), for an undo toast.
   */
  /** Moves a list to the archive (photos are deleted on commit). Returns undo/commit for a toast. */
  archiveList: (id: string) => {
    load();
    const list = state.lists[id];
    if (!list) return null;
    const wasCurrent = state.currentId === id;
    update((s) => moveToArchive(s, [id]));
    return {
      undo: () =>
        update((s) => {
          const archived = { ...s.archived };
          delete archived[id];
          return { ...s, archived, lists: { ...s.lists, [id]: list }, currentId: wasCurrent ? id : s.currentId };
        }),
      commit: () => void deletePhotos(list.items.filter((i) => i.photo).map((i) => i.id)),
    };
  },

  /** Archives every completed list at once (e.g. to free space). Returns how many. */
  archiveCompleted: () => {
    load();
    const ids = Object.values(state.lists).filter(isComplete).map((l) => l.id);
    if (ids.length === 0) return 0;
    const photos = ids.flatMap((id) => state.lists[id]!.items.filter((i) => i.photo).map((i) => i.id));
    update((s) => moveToArchive(s, ids));
    void deletePhotos(photos);
    return ids.length;
  },

  restoreList: (id: string) =>
    update((s) => {
      const entry = s.archived?.[id];
      if (!entry) return s;
      const archived = { ...s.archived };
      delete archived[id];
      const { archivedAt: _archivedAt, ...list } = entry;
      void _archivedAt;
      return { ...s, archived, lists: { ...s.lists, [id]: { ...list, updatedAt: Date.now() } } };
    }),

  /** Deletes an archived list for good; its totals and postcard stay in lifetime stats. */
  deleteArchived: (id: string) =>
    update((s) => {
      const entry = s.archived?.[id];
      if (!entry) return s;
      const archived = { ...s.archived };
      delete archived[id];
      return { ...s, archived, archive: addToArchive(s.archive, entry) };
    }),

  setAutoArchive: (autoArchive: AutoArchive) => update((s) => ({ ...s, autoArchive })),

  markBackedUp: () => update((s) => ({ ...s, lastBackupAt: Date.now() })),

  /** Replaces everything with a restored backup (run through the same upgrade path as saved data). */
  replaceAll: (data: unknown) => {
    const next = parse(JSON.stringify(data));
    if (!next) return false;
    update(() => ({ ...next, lastBackupAt: Date.now() }));
    return true;
  },

  /** Applies the auto-archive setting. Photos of archived lists are deleted. */
  runAutoArchive: () => {
    load();
    const mode = state.autoArchive ?? "off";
    if (mode === "off") return;
    const active = Object.values(state.lists).filter((l) => !isBlank(l));
    const done = active.filter(isComplete).sort((a, b) => a.updatedAt - b.updatedAt);
    let ids: string[] = [];
    if (mode === "30d") {
      const cutoff = Date.now() - 30 * 86_400_000;
      ids = done.filter((l) => l.updatedAt < cutoff).map((l) => l.id);
    } else {
      const over = active.length - FLEET_MAX;
      ids = over > 0 ? done.slice(0, over).map((l) => l.id) : [];
    }
    if (ids.length === 0) return;
    const photos = ids.flatMap((id) => state.lists[id]!.items.filter((i) => i.photo).map((i) => i.id));
    update((s) => moveToArchive(s, ids));
    void deletePhotos(photos);
  },

  deleteList: (id: string) => {
    load();
    const list = state.lists[id];
    if (!list) return null;
    const wasCurrent = state.currentId === id;
    update((s) => {
      const lists = { ...s.lists };
      delete lists[id];
      return { ...s, lists, currentId: s.currentId === id ? null : s.currentId };
    });
    return {
      undo: () =>
        update((s) => ({
          ...s,
          lists: { ...s.lists, [id]: list },
          currentId: wasCurrent ? id : s.currentId,
        })),
      commit: () => {
        void deletePhotos(list.items.filter((i) => i.photo).map((i) => i.id));
        update((s) => ({ ...s, archive: addToArchive(s.archive, list) }));
      },
    };
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

  /** Adds items to the current list and returns their ids. */
  addItems: (names: string[], opts: { photo?: boolean } = {}): string[] => {
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (clean.length === 0) return [];
    const added = clean.map((name) => ({ id: newId(), name, ...(opts.photo ? { photo: true } : {}) }));
    updateList((l) => ({ ...l, items: [...l.items, ...added] }));
    return added.map((i) => i.id);
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

  /** Removes an item. Returns `undo` / `commit` for an undo toast. */
  removeItem: (id: string) => {
    load();
    const listId = state.currentId;
    const before = listId ? state.lists[listId] : undefined;
    const index = before?.items.findIndex((i) => i.id === id) ?? -1;
    if (!before || index < 0) return null;
    const item = before.items[index]!;
    const decision = before.decisions[id];
    const outcome = before.outcomes[id];
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
    return {
      undo: () =>
        updateListById(before.id, (l) => {
          const items = [...l.items];
          items.splice(Math.min(index, items.length), 0, item);
          return {
            ...l,
            items,
            decisions: decision ? { ...l.decisions, [id]: decision } : l.decisions,
            outcomes: outcome ? { ...l.outcomes, [id]: outcome } : l.outcomes,
          };
        }),
      commit: () => {
        if (item.photo) void deletePhotos([id]);
      },
    };
  },

  /** Empties the current list. Returns `undo` / `commit` for an undo toast. */
  clearItems: () => {
    load();
    const current = state.currentId ? state.lists[state.currentId] : undefined;
    if (!current || current.items.length === 0) return null;
    const snapshot = current;
    updateList((l) => ({ ...l, items: [], decisions: {}, history: [], outcomes: {} }));
    return {
      undo: () =>
        updateListById(snapshot.id, (l) => ({
          ...l,
          // Keep anything added since, after the restored items.
          items: [...snapshot.items, ...l.items],
          decisions: { ...snapshot.decisions, ...l.decisions },
          history: snapshot.history,
          outcomes: { ...snapshot.outcomes, ...l.outcomes },
        })),
      commit: () => void deletePhotos(snapshot.items.filter((i) => i.photo).map((i) => i.id)),
    };
  },

  renameItem: (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateList((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id && i.name !== trimmed ? { ...i, name: trimmed } : i)),
    }));
  },

  /** Keep-only-N: a whole number above zero, or undefined to turn it off. */
  setKeepLimit: (limit: number | undefined) =>
    updateList((l) => ({
      ...l,
      keepLimit: limit && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : undefined,
    })),

  setChecklist: (checklist: boolean) => updateList((l) => ({ ...l, checklist: checklist || undefined })),

  togglePacked: (id: string) =>
    updateList((l) => ({
      ...l,
      outcomes: { ...l.outcomes, [id]: { ...l.outcomes[id], packed: !l.outcomes[id]?.packed } },
    })),

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

  markAltitudeSeen: (level: number) =>
    update((s) => (s.seenAltitude !== undefined && s.seenAltitude >= level ? s : { ...s, seenAltitude: level })),

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

/** Lifetime totals: every saved list plus lists that were deleted. */
export function useStats() {
  const { lists, archive, archived } = useAppState();
  const hydrated = useHydrated();

  return useMemo(() => {
    const active = Object.values(lists).filter((l) => !isBlank(l));
    // Archived lists still count toward totals and postcards.
    const saved = [...active, ...Object.values(archived ?? {})];
    const byDestination: Partial<Record<Destination, number>> = { ...archive?.byDestination };
    let kept = archive?.kept ?? 0;
    let letgo = archive?.letgo ?? 0;
    let gone = archive?.gone ?? 0;
    let sorted = (archive?.kept ?? 0) + (archive?.letgo ?? 0);
    let finished = archive?.finished ?? 0;
    const postcards: Postcard[] = [...(archive?.postcards ?? [])];
    /** Let-go items not handled yet, per list, for reminders. */
    const waiting: { list: ListState; items: Item[] }[] = [];

    for (const list of saved) {
      const s = summarize(list);
      kept += s.keep.length;
      letgo += s.letgo.length;
      gone += s.handled;
      sorted += s.keep.length + s.letgo.length + s.maybe.length;
      if (list.items.length > 0 && s.undecided.length === 0 && s.maybe.length === 0) {
        finished += 1;
        postcards.push(postcardFor(list));
      }
      for (const item of s.letgo) {
        const o = list.outcomes[item.id];
        if (o?.done && o.destination) byDestination[o.destination] = (byDestination[o.destination] ?? 0) + 1;
      }
      const pending = s.letgo.filter((i) => !list.outcomes[i.id]?.done);
      if (pending.length > 0) waiting.push({ list, items: pending });
    }
    waiting.sort((a, b) => b.items.length - a.items.length);

    return {
      hydrated,
      lists: saved.length + (archive?.lists ?? 0),
      finished,
      sorted,
      kept,
      letgo,
      gone,
      byDestination,
      waiting,
      waitingCount: waiting.reduce((n, w) => n + w.items.length, 0),
      postcards: postcards.sort((a, b) => b.date - a.date),
    };
  }, [lists, archive, archived, hydrated]);
}

/** Finished: everything sorted, no maybes left, and every let-go item gone. */
export function isComplete(list: ListState) {
  if (list.items.length === 0) return false;
  const { undecided, maybe, letgo, handled } = summarize(list);
  return undecided.length === 0 && maybe.length === 0 && handled === letgo.length;
}

/** Archived lists (newest first) and the auto-archive setting. */
export function useArchived() {
  const { archived, autoArchive } = useAppState();
  return useMemo(
    () => ({
      archived: Object.values(archived ?? {}).sort((a, b) => b.archivedAt - a.archivedAt),
      autoArchive: autoArchive ?? "off",
    }),
    [archived, autoArchive]
  );
}

/** The saved state as it is right now (for backups). */
export function snapshot(): AppState {
  load();
  return state;
}
