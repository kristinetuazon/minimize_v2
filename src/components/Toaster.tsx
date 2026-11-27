"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { dismissToast, undoToast, useToast } from "@/lib/toast";

/** The toast at the bottom of the screen ("Deleted · Undo"). */
export function Toaster() {
  const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!toast || !ref.current || prefersReducedMotion()) return;
      gsap.fromTo(ref.current, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "back.out(1.8)" });
    },
    { dependencies: [toast?.id] }
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] print:hidden"
    >
      {toast ? (
        <div
          ref={ref}
          key={toast.id}
          className="pointer-events-auto flex items-center gap-4 border-2 border-ink bg-ink py-2 pr-2 pl-4 text-bg shadow-[4px_4px_0_var(--card)]"
        >
          <span>{toast.message}</span>
          {toast.undoable ? (
            <button
              type="button"
              onClick={undoToast}
              className="border-2 border-bg/60 px-3 py-1 font-heading text-sm uppercase hover:bg-bg/15"
            >
              Undo
            </button>
          ) : null}
          <button type="button" onClick={dismissToast} aria-label="Dismiss" className="px-2 text-lg leading-none opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
