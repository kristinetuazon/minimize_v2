"use client";

import { useEffect, useSyncExternalStore } from "react";

/*
 * Asks the browser to keep Minimize's data even when the device is low on
 * space (navigator.storage.persist). Chrome usually grants this quietly for
 * installed apps or sites you use a lot; Firefox may ask; Safari decides on
 * its own. Without it, data can be cleared under storage pressure.
 */

export type Persistence = "unknown" | "persisted" | "not-persisted" | "unsupported";

let status: Persistence = "unknown";
let requested = false;
const listeners = new Set<() => void>();
const set = (next: Persistence) => {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => l());
};

async function check() {
  if (typeof navigator === "undefined" || !navigator.storage?.persisted) return set("unsupported");
  try {
    set((await navigator.storage.persisted()) ? "persisted" : "not-persisted");
  } catch {
    set("unsupported");
  }
}

/** Requests protection (once per visit unless forced, e.g. from a button). */
export async function requestPersistence(force = false) {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return set("unsupported");
  if (requested && !force) return;
  requested = true;
  try {
    set((await navigator.storage.persist()) ? "persisted" : "not-persisted");
  } catch {
    set("not-persisted");
  }
}

export function usePersistence(): Persistence {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status,
    () => "unknown" as Persistence
  );
  useEffect(() => {
    if (status === "unknown") void check();
  }, []);
  return value;
}
