"use client";

import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/content";
import { actions, useStats } from "@/lib/store";

/** "4 things still waiting to go", with a shortcut to each list's Act page. */
export function Reminders() {
  const router = useRouter();
  const { hydrated, waiting, waitingCount } = useStats();
  if (!hydrated || waitingCount === 0) return null;

  // What the waiting items are planned for, e.g. "2 to donate · 1 to sell".
  const plans = new Map<string, number>();
  for (const { list, items } of waiting) {
    for (const item of items) {
      const d = list.outcomes[item.id]?.destination;
      if (d) plans.set(d, (plans.get(d) ?? 0) + 1);
    }
  }
  const planText = DESTINATIONS.filter((d) => plans.has(d.value))
    .map((d) => `${plans.get(d.value)} ${d.label.replace(/^\S+\s/, "").toLowerCase()}`)
    .join(" · ");

  return (
    <aside
      data-reveal
      aria-label="Waiting to go"
      className="w-full max-w-md rounded-md border-2 border-dashed border-letgo/70 px-4 py-3 text-left"
    >
      <p className="font-heading text-sm uppercase">
        📦 {waitingCount} thing{waitingCount === 1 ? "" : "s"} still waiting to go
      </p>
      {planText ? <p className="text-sm opacity-80">{planText}</p> : null}
      <ul className="mt-2 flex flex-wrap gap-2">
        {waiting.slice(0, 4).map(({ list, items }) => (
          <li key={list.id}>
            <button
              type="button"
              onClick={() => {
                actions.openList(list.id);
                router.push("/results");
              }}
              className="rounded-full border-2 border-ink/50 px-3 py-1 text-sm hover:bg-sand"
            >
              {list.listName || "Untitled list"} · {items.length}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
