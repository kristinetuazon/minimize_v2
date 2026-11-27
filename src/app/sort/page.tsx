"use client";

import { Intro } from "@/components/Intro";
import { Stepper } from "@/components/Stepper";
import { SwipeDeck } from "@/components/SwipeDeck";
import { PageShell } from "@/components/ui";
import { QUESTIONS } from "@/lib/content";
import { useList } from "@/lib/store";

export default function SortPage() {
  const { list } = useList();

  return (
    <PageShell>
      <Stepper />
      <h1 data-reveal className="font-title text-5xl uppercase">
        {list.listName ? `Sorting ${list.listName}` : "Keep or let go?"}
      </h1>

      <Intro id="sort" summary="How sorting works">
        <p>
          One item at a time: does it still earn its place? Swipe <strong>right to keep</strong>,{" "}
          <strong>left to let go</strong>, or <strong>up for maybe</strong> if you need to think.
          You&apos;ll get a second look at the maybes at the end.
        </p>
        <p>Some questions to guide you:</p>
        <ul className="list-inside list-disc">
          {QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </Intro>

      <SwipeDeck />
    </PageShell>
  );
}
