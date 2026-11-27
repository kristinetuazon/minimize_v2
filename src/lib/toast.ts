"use client";

import { useSyncExternalStore } from "react";

/*
 * One toast at a time, used for "Deleted · Undo". Destructive actions apply
 * immediately; `commit` (e.g. deleting photos for good) runs when the toast
 * times out, is replaced, or the page is closed. `undo` puts things back.
 */

export type Undoable = { undo: () => void; commit: () => void };

type Toast = { id: number; message: string; undoable?: Undoable };

const DURATION = 5000;

let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function finish(commit: boolean) {
  clearTimeout(timer);
  const toast = current;
  current = null;
  if (commit) toast?.undoable?.commit();
  emit();
}

/** Shows a toast; if `undoable` is given it gets an Undo button. */
export function showToast(message: string, undoable?: Undoable | null) {
  if (current) finish(true);
  current = { id: nextId++, message, undoable: undoable ?? undefined };
  timer = setTimeout(() => finish(true), DURATION);
  emit();
}

export function undoToast() {
  current?.undoable?.undo();
  finish(false);
}

export const dismissToast = () => finish(true);

if (typeof window !== "undefined") {
  // Don't leave half-finished deletes behind if the page closes mid-toast.
  window.addEventListener("pagehide", () => current && finish(true));
}

export function useToast() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null
  );
}
