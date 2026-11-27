"use client";

import { useSyncExternalStore } from "react";

/*
 * Day / night theme. "system" (no saved choice) follows the device setting.
 * The choice lives in localStorage and is applied as <html data-theme="…">
 * by public/theme-init.js before the first paint, so there's never a flash.
 */

export type ThemeChoice = "light" | "dark" | "system";
export type Theme = "light" | "dark";

const KEY = "minimize:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEME_COLORS: Record<Theme, string> = { light: "#f6f0f1", dark: "#1b181c" };

// The pre-paint part lives in public/theme-init.js (same storage key).

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function readChoice(): ThemeChoice {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

const systemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

function resolve(choice: ThemeChoice): Theme {
  return choice === "system" ? systemTheme() : choice;
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  // Browser UI (address bar, PWA title bar) follows the page.
  const color = THEME_COLORS[resolve(choice)];
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Not saved, but still applied for this visit.
  }
  apply(choice);
  emit();
}

let synced = false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  // The pre-paint script set data-theme; bring theme-color in line once.
  if (!synced) {
    synced = true;
    apply(readChoice());
  }
  const mq = window.matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (readChoice() === "system") apply("system");
    cb();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      apply(readChoice());
      cb();
    }
  };
  mq.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}

/** The theme actually showing right now, or null before hydration. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(
    subscribe,
    () => resolve(readChoice()),
    () => null
  );
}

/**
 * Switches to the other theme. If that matches the device setting, the saved
 * choice is cleared so the app goes back to following the system.
 */
export function toggleTheme() {
  const next: Theme = resolve(readChoice()) === "dark" ? "light" : "dark";
  setTheme(next === systemTheme() ? "system" : next);
}
