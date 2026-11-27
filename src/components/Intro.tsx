"use client";

import { actions, useAppState, useHydrated } from "@/lib/store";

/**
 * Explanation text that starts open the first time, then stays tucked away
 * behind its summary once the person has read it.
 */
export function Intro({
  id,
  summary,
  children,
}: {
  id: string;
  summary: string;
  children: React.ReactNode;
}) {
  const { seenIntros } = useAppState();
  const hydrated = useHydrated();
  const seen = seenIntros.includes(id);

  return (
    <details
      // Re-mount once we know whether it's been seen, so `open` applies.
      key={hydrated ? `ready-${seen}` : "pending"}
      open={hydrated && !seen}
      onToggle={(e) => {
        if (!e.currentTarget.open) actions.markIntroSeen(id);
      }}
      className="group rounded-md border-2 border-dashed border-ink/40 px-4 py-3"
    >
      <summary className="font-heading text-sm uppercase tracking-wide marker:content-none">
        <span className="inline-block transition group-open:rotate-90">›</span>{" "}
        {summary}
      </summary>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
      <button
        type="button"
        className="mt-3 underline underline-offset-4"
        onClick={() => actions.markIntroSeen(id)}
      >
        Got it
      </button>
    </details>
  );
}
