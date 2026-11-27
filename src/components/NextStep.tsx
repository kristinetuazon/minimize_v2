"use client";

import { useRouter } from "next/navigation";
import { DESTINATIONS } from "@/lib/content";
import { actions, summarize, useList, useStats } from "@/lib/store";
import type { ListState } from "@/lib/types";
import { Button, Card } from "./ui";

type Step = { title: string; detail?: string; cta: string; href: string; progress?: number };

/** The one thing to do next with the current list. */
function stepFor(list: ListState): Step {
  const { undecided, keep, letgo, maybe, handled } = summarize(list);
  const total = list.items.length;
  const name = list.listName || "your list";
  const over = list.keepLimit ? keep.length - list.keepLimit : 0;
  const toGo = letgo.length - handled;

  if (undecided.length > 0)
    return {
      title: `Keep sorting ${name}`,
      detail: `${total - undecided.length} of ${total} sorted`,
      cta: "Continue",
      href: "/sort",
      progress: (total - undecided.length) / total,
    };
  if (maybe.length > 0)
    return {
      title: `Decide on ${maybe.length} maybe${maybe.length === 1 ? "" : "s"}`,
      detail: `Everything else in ${name} is sorted.`,
      cta: "Decide now",
      href: "/sort",
    };
  if (over > 0)
    return {
      title: `Narrow down ${name}`,
      detail: `${over} over your limit of ${list.keepLimit}.`,
      cta: "Narrow down",
      href: "/sort",
    };
  if (toGo > 0) {
    const plans = new Map<string, number>();
    for (const item of letgo) {
      const o = list.outcomes[item.id];
      if (!o?.done && o?.destination) plans.set(o.destination, (plans.get(o.destination) ?? 0) + 1);
    }
    const planText = DESTINATIONS.filter((d) => plans.has(d.value))
      .map((d) => `${plans.get(d.value)} to ${d.label.replace(/^\S+\s/, "").toLowerCase()}`)
      .join(" · ");
    return {
      title: `Let go of ${toGo} thing${toGo === 1 ? "" : "s"}`,
      detail: planText || `From ${name}. Pick a plan for each and tick them off.`,
      cta: "Let go",
      href: "/results",
      progress: handled / letgo.length,
    };
  }
  return { title: `${list.listName || "Your list"} is done ✨`, detail: "Ready for the next one?", cta: "", href: "" };
}

/**
 * Home's call to action. First visit: one button. Returning: a card with the
 * current list's next step, plus other lists that still have things to let go.
 */
export function NextStep() {
  const router = useRouter();
  const { list, hydrated } = useList();
  const { waiting } = useStats();

  const startNew = () => {
    actions.newList();
    router.push("/list");
  };

  // Before saved data loads, keep the space but show nothing that could flip.
  if (!hydrated) return <div className="h-14" />;

  if (list.items.length === 0) {
    return <Button onClick={startNew}>Start a list</Button>;
  }

  const step = stepFor(list);
  const others = waiting.filter((w) => w.list.id !== list.id);

  return (
    <section aria-label="Next step" className="w-full max-w-md text-left">
      <Card className="flex flex-col gap-4">
        <div>
          <p className="font-heading text-xs uppercase opacity-70">Next step</p>
          <h2 className="font-title text-3xl leading-tight">{step.title}</h2>
          {step.detail ? <p className="mt-1">{step.detail}</p> : null}
        </div>
        {step.progress !== undefined ? (
          <div className="h-2 overflow-hidden rounded-full bg-ink/15" aria-hidden>
            <div className="h-full rounded-full bg-ink" style={{ width: `${Math.round(step.progress * 100)}%` }} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          {step.cta ? (
            <Button href={step.href}>{step.cta} →</Button>
          ) : (
            <Button onClick={startNew}>Start a new list</Button>
          )}
          {step.cta ? (
            <Button variant="ghost" onClick={startNew}>
              New list
            </Button>
          ) : null}
        </div>
      </Card>

      {others.length > 0 ? (
        <div className="mt-4 text-sm">
          <p className="mb-2 font-heading text-xs uppercase opacity-70">Also waiting to go</p>
          <ul className="flex flex-wrap gap-2">
            {others.slice(0, 3).map(({ list: other, items }) => (
              <li key={other.id}>
                <button
                  type="button"
                  onClick={() => {
                    actions.openList(other.id);
                    router.push("/results");
                  }}
                  className="rounded-full border-2 border-ink/40 px-3 py-1 hover:bg-sand"
                >
                  {other.listName || "Untitled list"} · {items.length}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
