"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditableName } from "@/components/EditableName";
import { Intro } from "@/components/Intro";
import { Confetti, CountUp, ProgressBar, pop } from "@/components/motion";
import { Thumb } from "@/components/Photo";
import { ShareExport } from "@/components/ShareExport";
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
  // Confetti when the last item is ticked off now, not on every visit.
  const [justFinished, setJustFinished] = useState(false);

  function startNew() {
    actions.newList();
    router.push("/list");
  }

  if (!hydrated) return <PageShell><Stepper /></PageShell>;

  return (
    <PageShell>
      <Stepper />
      <h1 data-reveal className="font-title text-5xl uppercase">Time to act</h1>

      {sorted > 0 ? (
        <p data-reveal className="text-lg leading-relaxed">
          {list.listName ? <><strong>{list.listName}</strong>: you </> : "You "}
          kept <strong className="text-keep"><CountUp value={keep.length} /></strong> and are letting go of{" "}
          <strong className="text-letgo"><CountUp value={letgo.length} /></strong> of {list.items.length} item
          {list.items.length === 1 ? "" : "s"}.
        </p>
      ) : (
        <Card reveal className="text-center">
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
        <div data-reveal className="flex items-center justify-between gap-3 rounded-md border-2 border-dashed border-ink/50 px-4 py-3 print:hidden">
          <span>
            {undecided.length} item{undecided.length === 1 ? "" : "s"} still to sort.
          </span>
          <Button href="/sort" variant="secondary">Keep sorting</Button>
        </div>
      ) : null}

      {list.keepLimit && keep.length > list.keepLimit ? (
        <div
          data-reveal
          className="flex items-center justify-between gap-3 rounded-md border-2 border-letgo px-4 py-3 print:hidden"
        >
          <span>
            You&apos;re keeping {keep.length}, {keep.length - list.keepLimit} over your limit of {list.keepLimit}.
          </span>
          <Button href="/sort" variant="secondary">
            Narrow down
          </Button>
        </div>
      ) : null}

      {maybe.length > 0 ? (
        <Section title="Maybe" count={maybe.length} tone="text-maybe">
          <p className="mb-3 text-sm">Make the call here, or go back for a second swipe.</p>
          <ul className="divide-y divide-ink/20">
            {maybe.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex min-w-0 items-center gap-3">
                  <Thumb item={item} />
                  <EditableName item={item} />
                </span>
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
                <CountUp value={handled} /> / {letgo.length}
              </span>
            </div>
            <ProgressBar value={handled} max={letgo.length} label="Let-go items handled" />
          </div>
          <ul className="divide-y divide-ink/20">
            {letgo.map((item) => (
              <LetGoRow
                key={item.id}
                item={item}
                onDone={() => {
                  if (handled + 1 === letgo.length) setJustFinished(true);
                }}
              />
            ))}
          </ul>
          {handled === letgo.length ? (
            <p data-reveal className="relative mt-4 text-center font-heading uppercase">
              {justFinished ? <Confetti /> : null}
              ✨ All gone. Nicely done.
            </p>
          ) : null}
        </Section>
      ) : null}

      {keep.length > 0 ? <KeepSection keep={keep} /> : null}

      {sorted > 0 ? <ShareExport list={list} /> : null}

      <div data-reveal className="flex flex-wrap items-center justify-between gap-3 pt-4 print:hidden">
        <Button variant="ghost" href="/list">Edit list</Button>
        <Button variant="secondary" onClick={startNew}>New list</Button>
      </div>
    </PageShell>
  );
}

/** Kept items; optionally a packing checklist ("packed" / "put away"). */
function KeepSection({ keep }: { keep: Item[] }) {
  const { list } = useList();
  const checklist = !!list.checklist;
  const packed = keep.filter((i) => list.outcomes[i.id]?.packed).length;
  const [allPacked, setAllPacked] = useState(false);

  return (
    <Section title="Keep" count={keep.length} tone="text-keep">
      <label className="mb-4 flex cursor-pointer items-center justify-between gap-3 print:hidden">
        <span>
          <span className="font-heading text-sm uppercase">Use as a checklist</span>
          <span className="block text-sm opacity-75">Tick things off as they go in the bag or back on the shelf.</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={checklist}
          onChange={(e) => actions.setChecklist(e.target.checked)}
          className="size-5 shrink-0 accent-[var(--keep)]"
        />
      </label>

      {checklist ? (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Packed</span>
            <span>
              <CountUp value={packed} /> / {keep.length}
            </span>
          </div>
          <ProgressBar value={packed} max={keep.length} label="Kept items packed" tone="keep" />
        </div>
      ) : null}

      <ul className="divide-y divide-ink/20">
        {keep.map((item) => {
          const isPacked = !!list.outcomes[item.id]?.packed;
          return (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2">
              <span className="flex min-w-0 items-center gap-3">
                {checklist ? (
                  <input
                    type="checkbox"
                    aria-label={`Mark ${item.name} as packed`}
                    checked={isPacked}
                    onChange={(e) => {
                      if (!isPacked) {
                        pop(e.currentTarget.parentElement);
                        if (packed + 1 === keep.length) setAllPacked(true);
                      }
                      actions.togglePacked(item.id);
                    }}
                    className="size-5 shrink-0 accent-[var(--keep)]"
                  />
                ) : null}
                <Thumb item={item} />
                <EditableName item={item} className={checklist && isPacked ? "line-through opacity-60" : ""} />
              </span>
              <SmallButton tone="letgo" onClick={() => actions.decide(item.id, "letgo")}>
                Let go instead
              </SmallButton>
            </li>
          );
        })}
      </ul>
      {checklist && packed === keep.length ? (
        <p data-reveal className="relative mt-4 text-center font-heading uppercase">
          {allPacked ? <Confetti /> : null}
          🧳 All packed.
        </p>
      ) : null}
    </Section>
  );
}

function LetGoRow({ item, onDone }: { item: Item; onDone: () => void }) {
  const { list } = useList();
  const outcome = list.outcomes[item.id] ?? {};
  const checkboxId = `done-${item.id}`;

  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          aria-label={`Mark ${item.name} as gone`}
          checked={!!outcome.done}
          onChange={(e) => {
            if (!outcome.done) {
              pop(e.currentTarget.parentElement);
              onDone();
            }
            actions.toggleDone(item.id);
          }}
          className="size-5 accent-[var(--letgo)]"
        />
        <Thumb item={item} />
        <EditableName item={item} className={outcome.done ? "line-through opacity-60" : ""} />
      </div>
      <span className="flex items-center gap-2 pl-8 sm:pl-0">
        <span className="hidden text-sm print:inline">
          {DESTINATIONS.find((d) => d.value === outcome.destination)?.label}
        </span>
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
    <section data-reveal>
      <Card>
        <h2 className={`mb-4 flex items-baseline justify-between font-title text-4xl uppercase`}>
          <span>{title}</span>
          <CountUp value={count} className={`font-heading text-xl ${tone}`} />
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
