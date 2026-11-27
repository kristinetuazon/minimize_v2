"use client";

import { Intro } from "@/components/Intro";
import { Stepper } from "@/components/Stepper";
import { SwipeDeck } from "@/components/SwipeDeck";
import { SortGuide } from "@/components/SortGuide";
import { PageShell, Panel } from "@/components/ui";
import { useList } from "@/lib/store";

export default function SortPage() {
  const { list } = useList();

  return (
    <PageShell wide>
      <Stepper />
      {/* Desktop: title and guide on the left, the deck on the right. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <h1 data-reveal className="font-title text-5xl leading-tight">
            {list.listName ? `Sorting ${list.listName}` : "Keep or let go?"}
          </h1>

          {/* Phones: a collapsible drawer (open the first time). Desktop: always open. */}
          <div className="lg:hidden">
            <Intro id="sort" summary="Sorting guide">
              <SortGuide showTally={false} />
            </Intro>
          </div>
          <div data-reveal className="hidden lg:block">
            <Panel>
              <SortGuide />
            </Panel>
          </div>
        </div>

        <div data-reveal>
          <SwipeDeck />
        </div>
      </div>
    </PageShell>
  );
}
