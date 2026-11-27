"use client";

import { exportPhotos, replacePhotos } from "./photos";
import { actions, parse, snapshot } from "./store";
import { setTheme, type ThemeChoice } from "./theme";

/*
 * A backup is one JSON file with everything Minimize keeps on the device:
 * lists (including archived ones), decisions, plans, lifetime stats,
 * postcards, settings and photos (as data URLs). It never leaves the device
 * unless the person moves the file themselves.
 */

const APP = "minimize";
const VERSION = 1;

type BackupFile = {
  app: typeof APP;
  version: number;
  exportedAt: number;
  data: unknown;
  theme: ThemeChoice;
  photos: Record<string, string>;
};

export type BackupSummary = { lists: number; archived: number; photos: number; exportedAt: number };

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read photo"));
    reader.readAsDataURL(blob);
  });

const dataUrlToBlob = async (url: string) => (await fetch(url)).blob();

function readTheme(): ThemeChoice {
  try {
    const t = localStorage.getItem("minimize:theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function summarize(data: unknown, photos: number, exportedAt: number): BackupSummary | null {
  const state = parse(JSON.stringify(data));
  if (!state) return null;
  return {
    lists: Object.keys(state.lists).length,
    archived: Object.keys(state.archived ?? {}).length,
    photos,
    exportedAt,
  };
}

/** Builds the backup and downloads it. */
export async function downloadBackup() {
  const photos: Record<string, string> = {};
  for (const [id, blob] of Object.entries(await exportPhotos())) photos[id] = await blobToDataUrl(blob);
  const file: BackupFile = {
    app: APP,
    version: VERSION,
    exportedAt: Date.now(),
    data: snapshot(),
    theme: readTheme(),
    photos,
  };
  const date = new Date(file.exportedAt).toISOString().slice(0, 10);
  const url = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `minimize-backup-${date}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  actions.markBackedUp();
}

/** Reads and checks a backup file without changing anything yet. */
export async function readBackup(file: File): Promise<{ file: BackupFile; summary: BackupSummary }> {
  let parsed: Partial<BackupFile>;
  try {
    parsed = JSON.parse(await file.text()) as Partial<BackupFile>;
  } catch {
    throw new Error("That file isn't a Minimize backup.");
  }
  if (parsed.app !== APP || typeof parsed.version !== "number") throw new Error("That file isn't a Minimize backup.");
  if (parsed.version > VERSION) throw new Error("This backup is from a newer version of Minimize. Update the app first.");
  const photos = parsed.photos && typeof parsed.photos === "object" ? parsed.photos : {};
  const summary = summarize(parsed.data, Object.keys(photos).length, parsed.exportedAt ?? 0);
  if (!summary) throw new Error("This backup looks damaged, so nothing was changed.");
  return { file: { ...(parsed as BackupFile), photos }, summary };
}

/** Replaces everything on this device with the backup. */
export async function applyBackup(file: BackupFile) {
  const photos: Record<string, Blob> = {};
  for (const [id, url] of Object.entries(file.photos)) {
    if (typeof url === "string" && url.startsWith("data:image/")) photos[id] = await dataUrlToBlob(url);
  }
  if (!actions.replaceAll(file.data)) throw new Error("This backup looks damaged, so nothing was changed.");
  await replacePhotos(photos);
  if (file.theme) setTheme(file.theme);
}
