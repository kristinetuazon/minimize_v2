"use client";

import { QUESTIONS, questionIndex, tipsFor } from "@/lib/content";
import { useList } from "@/lib/store";

/**
 * Everything that helps while sorting: the controls, the question for the
 * card on top (highlighted), tips matched to what's being sorted, and a
 * running tally. Shared by the desktop side panel and the phone drawer.
 */
export function SortGuide({ showTally = true }: { showTally?: boolean }) {
  const { list, undecided, keep, letgo, maybe } = useList();
  const current = undecided[0] ?? maybe[0];
  const activeQuestion = current ? questionIndex(list.items.map((i) => i.id), current.id) : -1;
  const { label, tips } = tipsFor(`${list.listName} ${list.description}`);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="guide-controls">
        <h3 id="guide-controls" className="mb-2 font-heading text-sm uppercase">
          How to sort
        </h3>
        <ul className="grid gap-2 text-sm">
          <Control keys="→" gesture="Swipe right" action="Keep" tone="text-keep" />
          <Control keys="←" gesture="Swipe left" action="Let go" tone="text-letgo" />
          <Control keys="↑" gesture="Swipe up" action="Maybe: decide at the end" tone="text-maybe" />
          <Control keys="⌫" gesture="Backspace" action="Undo last" tone="" />
        </ul>
      </section>

      <section aria-labelledby="guide-questions">
        <h3 id="guide-questions" className="mb-2 font-heading text-sm uppercase">
          Ask yourself
        </h3>
        <ul className="grid gap-1">
          {QUESTIONS.map((q, i) => {
            const active = i === activeQuestion;
            return (
              <li
                key={q}
                aria-current={active ? "true" : undefined}
                className={`rounded px-2 py-1 transition-colors duration-300 ${
                  active ? "bg-card font-medium" : "opacity-75"
                }`}
              >
                {q}
                {active ? (
                  <span className="ml-2 font-heading text-[0.65rem] uppercase opacity-70">on this card</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="guide-tips">
        <h3 id="guide-tips" className="mb-2 font-heading text-sm uppercase">
          {label ? `Tips for ${label}` : "Rules of thumb"}
        </h3>
        <ul className="grid gap-2">
          {tips.map((t) => (
            <li key={t} className="flex gap-2">
              <span aria-hidden>✦</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        {label ? (
          <p className="mt-2 text-sm opacity-70">
            Stuck on something? Swipe up for maybe and come back to it at the end.
          </p>
        ) : null}
      </section>

      {showTally && keep.length + letgo.length + maybe.length > 0 ? (
        <section aria-labelledby="guide-tally">
          <h3 id="guide-tally" className="mb-2 font-heading text-sm uppercase">
            So far
          </h3>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Tally label="kept" value={keep.length} tone="text-keep" />
            <Tally label="let go" value={letgo.length} tone="text-letgo" />
            <Tally label="maybe" value={maybe.length} tone="text-maybe" />
          </dl>
          {list.keepLimit ? (
            <p className={`mt-2 text-sm ${keep.length > list.keepLimit ? "text-letgo" : "opacity-75"}`}>
              {keep.length > list.keepLimit
                ? `${keep.length - list.keepLimit} over your limit of ${list.keepLimit}. You'll narrow down at the end.`
                : `${list.keepLimit - keep.length} keep${list.keepLimit - keep.length === 1 ? "" : "s"} left under your limit of ${list.keepLimit}.`}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function Control({ keys, gesture, action, tone }: { keys: string; gesture: string; action: string; tone: string }) {
  return (
    <li className="flex items-center gap-3">
      <kbd className="flex size-8 shrink-0 items-center justify-center rounded border-2 border-ink/40 bg-bg font-body text-base">
        {keys}
      </kbd>
      <span className="opacity-75">{gesture}</span>
      <span className={`ml-auto font-heading text-xs uppercase ${tone}`}>{action}</span>
    </li>
  );
}

function Tally({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded border-2 border-ink/15 py-2">
      <dt className="sr-only">{label}</dt>
      <dd className={`font-title text-3xl leading-none ${tone}`}>{value}</dd>
      <dd aria-hidden className="mt-1 font-heading text-[0.65rem] uppercase">
        {label}
      </dd>
    </div>
  );
}
