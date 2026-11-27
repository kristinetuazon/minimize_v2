"use client";

import { useRef } from "react";
import { HeroTitle } from "@/components/HeroTitle";
import { InstallButton } from "@/components/InstallButton";
import { useReveal } from "@/components/motion";
import { NextStep } from "@/components/NextStep";
import { useLists } from "@/lib/store";

/**
 * Home: the title, then exactly one thing to do. First-timers get the pitch
 * and "Start a list"; returning people get their next step instead. Lists and
 * Progress live in the main navigation, so they aren't repeated here.
 */
export default function Home() {
  const { lists, hydrated } = useLists();
  const returning = hydrated && lists.length > 0;
  const mainRef = useRef<HTMLElement>(null);
  // Anything that appears after the intro (e.g. once saved lists load) fades in too.
  useReveal(mainRef);

  return (
    <main
      ref={mainRef}
      className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-3xl flex-col items-center justify-center gap-6 px-4 pt-8 pb-16 text-center sm:min-h-[calc(100dvh-4rem)] sm:pt-0"
    >
      <HeroTitle />
      <p data-reveal className="font-heading text-xl sm:text-2xl">
        curate, sort, free your life
      </p>
      {returning ? null : (
        <p data-reveal className="max-w-md text-lg leading-relaxed">
          List the things you want to declutter, swipe through them one at a time, and walk away
          with a plan for what stays and what goes.
        </p>
      )}

      <div data-reveal className="mt-4 flex w-full flex-col items-center gap-4">
        <NextStep />
        <InstallButton />
      </div>
    </main>
  );
}
