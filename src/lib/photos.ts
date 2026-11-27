"use client";

import { useEffect, useSyncExternalStore } from "react";

/*
 * Item photos live in IndexedDB (localStorage is far too small for images),
 * keyed by item id. Object URLs are cached here so every component showing
 * the same photo shares one URL.
 */

const DB_NAME = "minimize";
const STORE = "photos";
const MAX_SIZE = 1000; // px, longest side after resizing

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("Could not open photo storage"));
    });
  }
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void) {
  const database = await db();
  return new Promise<T | undefined>((resolve, reject) => {
    const t = database.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error ?? new Error("Photo storage failed"));
  });
}

/* ---------- object URL cache ---------- */

const urls = new Map<string, string | null>(); // null = known to have no photo
const loading = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setUrl(id: string, blob: Blob | undefined) {
  const old = urls.get(id);
  if (old) URL.revokeObjectURL(old);
  urls.set(id, blob ? URL.createObjectURL(blob) : null);
  emit();
}

async function ensureLoaded(id: string) {
  if (urls.has(id) || loading.has(id)) return;
  loading.add(id);
  try {
    setUrl(id, await tx<Blob>("readonly", (s) => s.get(id)));
  } catch {
    urls.set(id, null);
  } finally {
    loading.delete(id);
  }
}

/** The photo's object URL, or null while loading / when there is none. */
export function usePhotoUrl(id: string, hasPhoto: boolean | undefined): string | null {
  const url = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => (hasPhoto ? urls.get(id) ?? null : null),
    () => null
  );
  useEffect(() => {
    if (hasPhoto) void ensureLoaded(id);
  }, [id, hasPhoto]);
  return url;
}

/* ---------- writes ---------- */

/** Shrinks a camera photo to a sensible size and JPEG-encodes it. */
export async function resizeImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode photo"))), "image/jpeg", 0.82)
  );
}

export async function savePhoto(id: string, file: Blob) {
  const blob = await resizeImage(file);
  await tx("readwrite", (s) => void s.put(blob, id));
  setUrl(id, blob);
}

export async function deletePhotos(ids: string[]) {
  if (ids.length === 0 || typeof indexedDB === "undefined") return;
  try {
    await tx("readwrite", (s) => ids.forEach((id) => s.delete(id)));
  } catch {
    // Nothing to clean up.
  }
  ids.forEach((id) => setUrl(id, undefined));
}

/** Every stored photo, by item id (for backups). */
export async function exportPhotos(): Promise<Record<string, Blob>> {
  if (typeof indexedDB === "undefined") return {};
  const database = await db();
  return new Promise((resolve, reject) => {
    const out: Record<string, Blob> = {};
    const t = database.transaction(STORE, "readonly");
    const req = t.objectStore(STORE).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      out[String(cursor.key)] = cursor.value as Blob;
      cursor.continue();
    };
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error ?? new Error("Could not read photos"));
  });
}

/** Replaces every stored photo with the given ones (for restoring a backup). */
export async function replacePhotos(photos: Record<string, Blob>) {
  await tx("readwrite", (s) => {
    s.clear();
    for (const [id, blob] of Object.entries(photos)) s.put(blob, id);
  });
  for (const url of urls.values()) if (url) URL.revokeObjectURL(url);
  urls.clear();
  emit();
}
