"use client";

import { useEffect, useRef } from "react";
import { MOTION_OK, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Fades + lifts every `[data-reveal]` element inside `scope` into view, in
 * document order. Elements added later (after hydration, when data loads, or
 * as the person adds things) are picked up automatically; each animates once.
 *
 * Before JS runs, CSS hides `[data-reveal]` (see globals.css) so there's no
 * flash of content; a CSS fallback reveals them if this never runs.
 */
export function useReveal(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    (_ctx, contextSafe) => {
      const root = scope.current;
      if (!root) return;

      const reveal = contextSafe!(() => {
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-revealed])", root);
        if (els.length === 0) return;
        els.forEach((el) => el.setAttribute("data-revealed", ""));
        if (prefersReducedMotion()) {
          gsap.set(els, { autoAlpha: 1 });
          return;
        }
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07, clearProps: "transform" }
        );
      });

      reveal();
      // When elements are added, reveal them on the next frame. Text-only
      // changes (like CountUp ticking every frame) are ignored, and a pending
      // frame is never pushed back, so constant updates can't starve this.
      let frame = 0;
      const observer = new MutationObserver((records) => {
        const addedElement = records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === 1));
        if (!addedElement || frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          reveal();
        });
      });
      observer.observe(root, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    },
    { scope }
  );
}

/** A wrapper that reveals its `[data-reveal]` descendants. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** A number that counts from its previous value to the new one. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        shown.current = value;
        el.textContent = String(value);
        return;
      }
      const counter = { n: shown.current };
      gsap.to(counter, {
        n: value,
        duration: Math.min(1.2, 0.4 + Math.abs(value - shown.current) * 0.08),
        ease: "power2.out",
        onUpdate: () => {
          shown.current = Math.round(counter.n);
          el.textContent = String(shown.current);
        },
      });
      if (value !== counter.n) gsap.fromTo(el, { scale: 1.25 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    },
    { dependencies: [value] }
  );

  return (
    <span ref={ref} className={`inline-block tabular-nums ${className ?? ""}`}>
      {/* Server / first paint shows the real value; the tween takes over on mount. */}
      {value}
    </span>
  );
}

const CONFETTI_COLORS = ["var(--keep)", "var(--letgo)", "var(--maybe)", "var(--card)", "var(--ink)"];

/** Fires a little burst of confetti from the element's centre when mounted. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const els = Array.from({ length: pieces }, (_, i) => {
        const el = document.createElement("span");
        const size = gsap.utils.random(6, 11);
        Object.assign(el.style, {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: `${size}px`,
          height: `${size * gsap.utils.random(0.4, 1)}px`,
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          borderRadius: i % 3 === 0 ? "50%" : "1px",
          pointerEvents: "none",
        });
        host.appendChild(el);
        return el;
      });
      els.forEach((el) => {
        const angle = gsap.utils.random(0, Math.PI * 2);
        const dist = gsap.utils.random(80, 220);
        gsap
          .timeline({ onComplete: () => el.remove() })
          .to(el, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 60,
            rotation: gsap.utils.random(-540, 540),
            duration: gsap.utils.random(0.6, 0.9),
            ease: "power3.out",
          })
          .to(el, { y: "+=140", autoAlpha: 0, duration: gsap.utils.random(0.7, 1.1), ease: "power1.in" });
      });
      return () => els.forEach((el) => el.remove());
    });
    return () => mm.revert();
  }, [pieces]);

  return <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" />;
}

/** A bar that springs to `value / max`. GSAP owns its width. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const fill = useRef<HTMLDivElement>(null);
  const pct = max > 0 ? (value / max) * 100 : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return void gsap.set(fill.current, { width: `${pct}%` });
      gsap.to(fill.current, { width: `${pct}%`, duration: 0.9, ease: "elastic.out(1, 0.6)" });
    },
    { dependencies: [pct] }
  );

  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-ink/15"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div ref={fill} className="h-full w-0 bg-letgo" />
    </div>
  );
}

/** A quick squash-and-stretch on an element (e.g. when it's ticked off). */
export function pop(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(el, { scale: 1.2 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.5)" });
}

/** Slides an element out (and collapses its height), then calls `done`. */
export function animateOut(el: HTMLElement | null, done: () => void) {
  if (!el || prefersReducedMotion()) return done();
  gsap
    .timeline({ onComplete: done })
    .to(el, { x: 40, autoAlpha: 0, duration: 0.2, ease: "power2.in" })
    .to(el, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, duration: 0.18, ease: "power2.inOut" });
}
