"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { toggleTheme, useTheme } from "@/lib/theme";

/**
 * Sun / moon button in the header. Switching grows the new theme out of the
 * button as a circle (View Transitions where supported) and spins the icon.
 */
export function ThemeToggle() {
  const theme = useTheme();
  const button = useRef<HTMLButtonElement>(null);
  const icon = useRef<HTMLSpanElement>(null);
  const night = theme === "dark";

  // Spin + bounce the icon whenever the theme changes (not on first load).
  const first = useRef(true);
  useGSAP(
    () => {
      if (theme === null) return;
      if (first.current) {
        first.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        icon.current,
        { rotation: night ? -90 : 90, scale: 0.4, autoAlpha: 0 },
        { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2.2)" }
      );
    },
    { dependencies: [theme] }
  );

  function onClick() {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || prefersReducedMotion() || !button.current) {
      toggleTheme();
      return;
    }
    // Grow the circle from the button's centre to the farthest corner.
    const r = button.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement.style;
    root.setProperty("--theme-x", `${x}px`);
    root.setProperty("--theme-y", `${y}px`);
    root.setProperty("--theme-r", `${radius}px`);
    doc.startViewTransition(() => flushSync(toggleTheme));
  }

  return (
    <button
      ref={button}
      type="button"
      onClick={onClick}
      aria-label={night ? "Switch to day mode" : "Switch to night mode"}
      title={night ? "Day mode" : "Night mode"}
      aria-pressed={theme === null ? undefined : night}
      className="flex size-10 items-center justify-center rounded-full border-2 border-ink/50 hover:bg-sand print:hidden"
    >
      <span ref={icon} className="flex" aria-hidden>
        {theme === null ? (
          <span className="size-5" />
        ) : night ? (
          // Sun: shown at night, switches to day
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          // Moon: shown by day, switches to night
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
