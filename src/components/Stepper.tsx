"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useList } from "@/lib/store";

const STEPS = [
  { n: 1, label: "List", note: "Pack the basket", href: "/list" },
  { n: 2, label: "Sort", note: "Lift off", href: "/sort" },
  { n: 3, label: "Act", note: "Drop the sandbags", href: "/results" },
] as const;

/** Where each stop sits across the window, in %. */
const POS = [14, 50, 86];

// Remembered between pages so the balloon can glide from the previous stop.
let lastIndex: number | null = null;

/**
 * The List → Sort → Act steps as a balloon's flight path across the full
 * width of the window: solid behind you, dashed ahead, with the balloon
 * floating over the step you're on.
 */
export function Stepper() {
  const pathname = usePathname();
  const { list } = useList();
  const hasItems = list.items.length > 0;
  const hasDecisions = Object.keys(list.decisions).length > 0;
  const enabled = [true, hasItems, hasDecisions];
  const current = Math.max(0, STEPS.findIndex((s) => s.href === pathname));
  const ref = useRef<HTMLElement>(null);
  const balloon = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const from = lastIndex;
      lastIndex = current;
      if (prefersReducedMotion()) return;
      if (from !== null && from !== current) {
        gsap.fromTo(
          balloon.current,
          { left: `${POS[from]}%` },
          { left: `${POS[current]}%`, duration: 1.1, ease: "power2.inOut" }
        );
      }
      gsap.to(balloon.current, { y: -4, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: ref, dependencies: [current] }
  );

  return (
    <nav
      ref={ref}
      aria-label="Steps"
      data-reveal
      // Full-bleed: breaks out of the page column to span the window.
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y-2 border-ink/15 bg-gradient-to-b from-sand/70 to-transparent print:hidden"
    >
      {/* Route: solid up to the current stop, dashed after it. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[3.25rem] h-6 w-full"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <clipPath id="route-done">
            <rect x="0" y="0" width={POS[current]} height="10" />
          </clipPath>
        </defs>
        <path
          d="M0 6 C 15 2, 30 9, 50 5 S 85 2, 100 6"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="5 6"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 6 C 15 2, 30 9, 50 5 S 85 2, 100 6"
          clipPath="url(#route-done)"
          stroke="var(--ink)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* A couple of clouds for atmosphere */}
      <svg aria-hidden className="pointer-events-none absolute top-2 left-[30%] h-5 w-12 opacity-40" viewBox="0 0 44 16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1">
        <path d="M1 14c0-5 4-8 9-7 2-4 7-6 11-3 3-3 9-1 10 4 4 0 7 3 6 6z" />
      </svg>
      <svg aria-hidden className="pointer-events-none absolute top-6 left-[68%] h-4 w-10 opacity-30" viewBox="0 0 44 16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1">
        <path d="M1 14c0-5 4-8 9-7 2-4 7-6 11-3 3-3 9-1 10 4 4 0 7 3 6 6z" />
      </svg>

      <div className="relative h-32 sm:h-36">
        {/* The balloon over the current step */}
        <div ref={balloon} aria-hidden className="absolute top-1 -translate-x-1/2" style={{ left: `${POS[current]}%` }}>
          <svg viewBox="0 0 24 32" className="h-10 w-8" fill="none" stroke="var(--ink)" strokeWidth="1.4">
            <path d="M12 2c6 0 9 4.5 9 9.5 0 4.5-3.5 8-6 10.5h-6C6.5 19.5 3 16 3 11.5 3 6.5 6 2 12 2z" fill="var(--card)" />
            <path d="M12 2c-2.5 3-3 9-2 20M12 2c2.5 3 3 9 2 20M9 22l1 4M15 22l-1 4" />
            <rect x="9" y="26" width="6" height="4" rx="1" fill="var(--paper)" />
          </svg>
        </div>

        <ol>
          {STEPS.map((step, i) => {
            const isCurrent = i === current;
            const done = i < current;
            const canGo = enabled[i] && !isCurrent;
            const dot = `flex size-9 items-center justify-center rounded-full border-2 font-heading text-sm transition ${
              isCurrent
                ? "border-ink bg-card shadow-[3px_3px_0_var(--ink)]"
                : done
                  ? "border-ink bg-ink text-bg"
                  : enabled[i]
                    ? "border-ink/60 bg-paper"
                    : "border-dashed border-ink/40 bg-paper opacity-60"
            }`;
            const inner = (
              <>
                <span className={dot}>{done ? "✓" : step.n}</span>
                <span className="mt-1.5 font-heading text-sm uppercase">{step.label}</span>
                <span className="hidden text-xs italic opacity-70 sm:block">{step.note}</span>
              </>
            );
            return (
              <li
                key={step.href}
                className="absolute top-[3.1rem] flex -translate-x-1/2 flex-col items-center text-center"
                style={{ left: `${POS[i]}%` }}
              >
                {canGo ? (
                  <Link href={step.href} className="flex flex-col items-center hover:opacity-80">
                    {inner}
                  </Link>
                ) : (
                  <span
                    className={`flex flex-col items-center ${enabled[i] || isCurrent ? "" : "opacity-50"}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
