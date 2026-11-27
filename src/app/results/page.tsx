"use client";

import { useRouter } from "next/navigation";
import { Intro } from "@/components/Intro";
import { Stepper } from "@/components/Stepper";
import { Button, Card, PageShell } from "@/components/ui";
import { DESTINATIONS } from "@/lib/content";
import { actions, useList } from "@/lib/store";
import type { Destination, Item } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const { list, hydrated, undecided, keep, letgo, maybe } = useList();
  const handled = letgo.filter((i) => list.outcomes[i.id]?.done).length;
  const sorted = keep.length + letgo.length + maybe.length;

  function startOver() {
    if (!window.confirm("Clear this list and start a new one?")) return;
    actions.startOver();
    router.push("/list");
  }

  if (!hydrated) return <PageShell><Stepper /></PageShell>;

  return (
    <PageShell>
      <Stepper />
      <h1 className="font-title text-5xl uppercase">Time to act</h1>

      {sorted > 0 ? (
        <p className="text-lg leading-relaxed">
          {list.listName ? <><strong>{list.listName}</strong>: you </> : "You "}
          kept <strong className="text-keep">{keep.length}</strong> and are letting go of{" "}
          <strong className="text-letgo">{letgo.length}</strong> of {list.items.length} item
          {list.items.length === 1 ? "" : "s"}.
        </p>
      ) : (
        <Card className="text-center">
          <p className="mb-4 text-lg">Nothing sorted yet.</p>
          <Button href={list.items.length ? "/sort" : "/list"}>
            {list.items.length ? "Start sorting" : "Make a list"}
          </Button>
        </Card>
      )}

      <Intro id="results" summary="Making it stick">
        <p>For change to happen, you have to act on what you decided.</p>
        <p>
          The things you keep: cherish them and make them last. The things you let go: instead of
          throwing them away, try donating, selling, or giving them to someone who&apos;ll use them.
          Pick a plan for each one below and tick it off when it&apos;s gone.
        </p>
      </Intro>

      {undecided.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-md border-2 border-dashed border-ink/50 px-4 py-3">
          <span>
            {undecided.length} item{undecided.length === 1 ? "" : "s"} still to sort.
          </span>
          <Button href="/sort" variant="secondary">Keep sorting</Button>
        </div>
      ) : null}

      {maybe.length > 0 ? (
        <Section title="Maybe" count={maybe.length} tone="text-maybe">
          <p className="mb-3 text-sm">Make the call here, or go back for a second swipe.</p>
          <ul className="divide-y divide-ink/20">
            {maybe.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{item.name}</span>
                <span className="flex gap-2">
                  <SmallButton tone="keep" onClick={() => actions.decide(item.id, "keep")}>Keep</SmallButton>
                  <SmallButton tone="letgo" onClick={() => actions.decide(item.id, "letgo")}>Let go</SmallButton>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {letgo.length > 0 ? (
        <Section title="Let go" count={letgo.length} tone="text-letgo">
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span>Handled</span>
              <span>
                {handled} / {letgo.length}
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-ink/15"
              role="progressbar"
              aria-label="Let-go items handled"
              aria-valuemin={0}
              aria-valuemax={letgo.length}
              aria-valuenow={handled}
            >
              <div
                className="h-full bg-letgo transition-[width]"
                style={{ width: `${(handled / letgo.length) * 100}%` }}
              />
            </div>
          </div>
          <ul className="divide-y divide-ink/20">
            {letgo.map((item) => (
              <LetGoRow key={item.id} item={item} />
            ))}
          </ul>
          {handled === letgo.length ? (
            <p className="mt-4 text-center font-heading uppercase">✨ All gone. Nicely done.</p>
          ) : null}
        </Section>
      ) : null}

      {keep.length > 0 ? (
        <Section title="Keep" count={keep.length} tone="text-keep">
          <ul className="divide-y divide-ink/20">
            {keep.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                <span>{item.name}</span>
                <SmallButton tone="letgo" onClick={() => actions.decide(item.id, "letgo")}>
                  Let go instead
                </SmallButton>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <Button variant="ghost" href="/list">Edit list</Button>
        <Button variant="secondary" onClick={startOver}>Start a new list</Button>
      </div>
    </PageShell>
  );
}

function LetGoRow({ item }: { item: Item }) {
  const { list } = useList();
  const outcome = list.outcomes[item.id] ?? {};
  const checkboxId = `done-${item.id}`;

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <label htmlFor={checkboxId} className="flex items-center gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={!!outcome.done}
          onChange={() => actions.toggleDone(item.id)}
          className="size-5 accent-[var(--letgo)]"
        />
        <span className={outcome.done ? "line-through opacity-60" : ""}>{item.name}</span>
      </label>
      <span className="flex items-center gap-2 pl-8 sm:pl-0">
        <select
          aria-label={`Plan for ${item.name}`}
          value={outcome.destination ?? ""}
          onChange={(e) =>
            actions.setDestination(item.id, (e.target.value || undefined) as Destination | undefined)
          }
          className="rounded-md border-2 border-ink/60 bg-paper px-2 py-1.5 text-sm"
        >
          <option value="">Choose a plan…</option>
          {DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <SmallButton tone="keep" onClick={() => actions.decide(item.id, "keep")}>
          Keep
        </SmallButton>
      </span>
    </li>
  );
}

function Section({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <Card>
        <h2 className={`mb-4 flex items-baseline justify-between font-title text-4xl uppercase`}>
          <span>{title}</span>
          <span className={`font-heading text-xl ${tone}`}>{count}</span>
        </h2>
        {children}
      </Card>
    </section>
  );
}

function SmallButton({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "keep" | "letgo";
}) {
  const tones = { keep: "border-keep text-keep", letgo: "border-letgo text-letgo" };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 bg-paper px-3 py-1 text-sm hover:bg-sand ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
