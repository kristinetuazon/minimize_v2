"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { actions, useAppState } from "@/lib/store";
import { useAltitude } from "./Balloon";
import { Confetti } from "./motion";

/**
 * Celebrates reaching a new altitude, wherever you are in the app. The first
 * time it runs it quietly records the current level, so existing progress
 * isn't celebrated all at once.
 */
export function AltitudeWatcher() {
  const altitude = useAltitude();
  const { seenAltitude } = useAppState();
  const [shown, setShown] = useState<string | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const { hydrated, level, name } = altitude;
  const balloon = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (seenAltitude === undefined) {
      actions.markAltitudeSeen(level);
      return;
    }
    if (level > seenAltitude) {
      // Show and record together on the next frame. (Recording first would
      // re-run this effect and cancel the celebration before it appears.)
      const id = requestAnimationFrame(() => {
        setShown(name);
        actions.markAltitudeSeen(level);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hydrated, level, name, seenAltitude]);

  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(null), 5000);
    return () => clearTimeout(t);
  }, [shown]);

  useGSAP(
    () => {
      if (!shown || prefersReducedMotion()) return;
      gsap.fromTo(card.current, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)" });
      gsap.fromTo(balloon.current, { y: 40 }, { y: -10, duration: 2.5, ease: "sine.out" });
    },
    { dependencies: [shown] }
  );

  if (!shown) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4 print:hidden"
    >
      <div
        ref={card}
        className="pointer-events-auto relative flex items-center gap-4 border-2 border-ink bg-paper px-5 py-4 shadow-[5px_5px_0_var(--card)]"
      >
        <Confetti pieces={28} />
        <svg ref={balloon} viewBox="0 0 24 32" className="h-12 w-9 shrink-0" fill="none" stroke="var(--ink)" strokeWidth="1.4" aria-hidden>
          <path d="M12 2c6 0 9 4.5 9 9.5 0 4.5-3.5 8-6 10.5h-6C6.5 19.5 3 16 3 11.5 3 6.5 6 2 12 2z" fill="var(--card)" />
          <path d="M12 2c-2.5 3-3 9-2 20M12 2c2.5 3 3 9 2 20M9 22l1 4M15 22l-1 4" />
          <rect x="9" y="26" width="6" height="4" rx="1" fill="var(--paper)" />
        </svg>
        <div>
          <p className="font-heading text-xs uppercase opacity-70">New altitude</p>
          <p className="font-title text-2xl leading-tight">You&apos;ve risen to {shown.toLowerCase()}</p>
        </div>
        <button
          type="button"
          onClick={() => setShown(null)}
          aria-label="Close"
          className="ml-2 px-2 text-lg leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
