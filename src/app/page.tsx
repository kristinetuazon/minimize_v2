"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { actions, useList } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { list, hydrated, undecided } = useList();
  const inProgress = hydrated && list.items.length > 0;

  const resumeHref =
    undecided.length > 0 ? "/sort" : Object.keys(list.decisions).length ? "/results" : "/list";

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center gap-6 px-4 pb-16 text-center">
      <h1 className="font-title text-[clamp(4rem,18vw,9rem)] leading-none">MINIMIZE</h1>
      <p className="font-heading text-xl sm:text-2xl">curate, sort, free your life</p>
      <p className="max-w-md text-lg leading-relaxed">
        List the things you want to declutter, swipe through them one at a time, and walk away
        with a plan for what stays and what goes.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        {inProgress ? (
          <>
            <Button href={resumeHref}>
              Continue {list.listName ? `“${list.listName}”` : "your list"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (!window.confirm("Clear your current list and start a new one?")) return;
                actions.startOver();
                router.push("/list");
              }}
            >
              Start a new list
            </Button>
          </>
        ) : (
          <Button href="/list">Start a list</Button>
        )}
      </div>
    </main>
  );
}
