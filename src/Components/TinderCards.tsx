import React, { useCallback, useEffect, useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import Container from "./Container";
import Button from "./Button";
import { useList } from "./GlobalContext";
import type { Choice } from "../types/global";

type CardApi = { swipe: (dir?: "left" | "right") => Promise<void> };

const toChoice = (dir: string): Choice | null =>
  dir === "right" ? "yes" : dir === "left" ? "no" : null;

/**
 * The swipe deck. Client-only: the sort page loads it with `ssr: false`
 * because react-tinder-card needs the browser.
 */
const TinderCards = () => {
  const { state, hydrated, remaining, decide, undoDecision, resetDecisions } =
    useList();
  // Cards that have been swiped but are still flying off screen.
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const cardRefs = useRef(new Map<string, CardApi>());

  const deck = remaining.filter((item) => !leaving.has(item.id));
  const top = deck[0];
  const total = state.items.length;
  const sortedCount = total - deck.length;

  const handleSwipe = (id: string) => {
    setLeaving((prev) => new Set(prev).add(id));
  };

  const handleLeftScreen = (id: string, dir: string) => {
    const choice = toChoice(dir);
    if (choice) decide(id, choice);
    setLeaving((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const swipeTop = useCallback(
    (dir: "left" | "right") => {
      if (!top) return;
      void cardRefs.current.get(top.id)?.swipe(dir);
    },
    [top]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") swipeTop("left");
      if (e.key === "ArrowRight") swipeTop("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipeTop]);

  if (!hydrated) return null;

  if (total === 0) {
    return (
      <Container title="Nothing to sort">
        <p className="text-center font-bodyRegular">
          Your list is empty. Add a few things first.
        </p>
        <div className="text-center">
          <Button page="/list">make a list</Button>
        </div>
      </Container>
    );
  }

  if (remaining.length === 0) {
    return (
      <Container title="All sorted">
        <p className="text-center font-bodyRegular">
          You made a decision on all {total} items.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button page="/results">see your results</Button>
          <Button onClick={resetDecisions}>sort again</Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-4 font-heading" aria-live="polite">
        {Math.min(sortedCount + 1, total)} / {total}
      </p>
      <div className="relative h-[320px] w-[90vw] max-w-[450px]">
        {/* Reversed so the first unsorted item is rendered last, on top. */}
        {[...remaining].reverse().map((item) => (
          <TinderCard
            key={item.id}
            ref={(api: CardApi | null) => {
              if (api) cardRefs.current.set(item.id, api);
              else cardRefs.current.delete(item.id);
            }}
            className="swipe absolute inset-x-0 top-0"
            preventSwipe={["up", "down"]}
            onSwipe={() => handleSwipe(item.id)}
            onCardLeftScreen={(dir) => handleLeftScreen(item.id, dir)}
          >
            <Container title={item.name}>
              <p className="w-full text-center font-bodyRegular">
                Does this give you joy? ✨
              </p>
            </Container>
          </TinderCard>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => swipeTop("left")}
          disabled={!top}
          className="border-2 bg-offWhite px-5 py-3 font-heading uppercase shadow-md hover:bg-powder disabled:opacity-50"
        >
          ⬅ let go
        </button>
        <button
          type="button"
          onClick={() => swipeTop("right")}
          disabled={!top}
          className="border-2 bg-offWhite px-5 py-3 font-heading uppercase shadow-md hover:bg-powder disabled:opacity-50"
        >
          keep ➡
        </button>
      </div>
      <button
        type="button"
        onClick={undoDecision}
        disabled={state.decisions.length === 0 || leaving.size > 0}
        className="mt-4 font-bodyRegular underline disabled:invisible"
      >
        undo last
      </button>
      <p className="mt-2 font-bodyRegular text-sm opacity-70">
        Tip: use the ← and → keys.
      </p>
    </div>
  );
};

export default TinderCards;
