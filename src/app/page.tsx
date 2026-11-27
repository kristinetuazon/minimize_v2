"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { HeroTitle } from "@/components/HeroTitle";
import { useReveal } from "@/components/motion";
import { InstallButton } from "@/components/InstallButton";
import { Button } from "@/components/ui";
import { actions, resumeHref, useList, useLists } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { list, hydrated } = useList();
  const { lists } = useLists();
  const hasCurrent = hydrated && list.items.length > 0;
  const mainRef = useRef<HTMLElement>(null);
  // Anything that appears after the intro (e.g. once saved lists load) fades in too.
  useReveal(mainRef);

  return (
    <main
      ref={mainRef}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center gap-6 px-4 pb-16 text-center"
    >
      <HeroTitle />
      <p data-reveal className="font-heading text-xl sm:text-2xl">
        curate, sort, free your life
      </p>
      <p data-reveal className="max-w-md text-lg leading-relaxed">
        List the things you want to declutter, swipe through them one at a time,
        and walk away with a plan for what stays and what goes.
      </p>

      {/* One group, so buttons that appear after saved data loads arrive together. */}
      <div data-reveal className="mt-4 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {hasCurrent ? (
            <Button href={resumeHref(list)}>
              Continue {list.listName ? `“${list.listName}”` : "your list"}
            </Button>
          ) : null}
          <Button
            variant={hasCurrent ? "secondary" : "primary"}
            onClick={() => {
              actions.newList();
              router.push("/list");
            }}
          >
            {hasCurrent ? "New list" : "Start a list"}
          </Button>
        </div>
        {hydrated && lists.length > 1 ? (
          <Button variant="ghost" href="/lists">
            All your lists ({lists.length})
          </Button>
        ) : null}
        <InstallButton />
      </div>
    </main>
  );
}
