"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { actions, useList } from "@/lib/store";
import type { Choice } from "@/lib/types";
import { Confetti } from "./motion";
import { Button, Card } from "./ui";
import { SwipeCard, type Direction, type SwipeCardHandle } from "./SwipeCard";

const STACK = 3; // cards visible at once

export function SwipeDeck() {
  const { list, hydrated, undecided, maybe, canUndo } = useList();
  const [reviewingMaybes, setReviewingMaybes] = useState(false);
  const topRef = useRef<SwipeCardHandle>(null);
  // A swipe asked for while the previous card is still flying off.
  const queued = useRef<Direction | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  // Confetti only when the last call is made now, not when reopening a finished list.
  const [celebrate, setCelebrate] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  // Unsorted items always come first; the maybe round starts only when asked.
  const inMaybeRound = undecided.length === 0 && reviewingMaybes;
  const deck = undecided.length > 0 ? undecided : inMaybeRound ? maybe : [];
  const total = list.items.length;
  const top = deck[0];

  // Once the next card is on top, apply any queued swipe.
  const topId = top?.id;
  useEffect(() => {
    const dir = queued.current;
    queued.current = null;
    if (dir && topId) topRef.current?.fling(dir);
  }, [topId]);

  const questionFor = (id: string) =>
    QUESTIONS[Math.max(0, list.items.findIndex((i) => i.id === id)) % QUESTIONS.length]!;

  const sortedCount = total - undecided.length;

  // Deal the visible cards in whenever a round (re)starts.
  const dealKey = !hydrated || !top ? "none" : inMaybeRound ? "maybe" : "main";
  useGSAP(
    () => {
      if (dealKey === "none" || !deckRef.current || prefersReducedMotion()) return;
      gsap.from(gsap.utils.toArray<HTMLElement>(".deal", deckRef.current).reverse(), {
        y: 260,
        x: () => gsap.utils.random(-60, 60),
        rotation: () => gsap.utils.random(-25, 25),
        autoAlpha: 0,
        duration: 0.7,
        ease: "back.out(1.2)",
        stagger: 0.09,
      });
    },
    { dependencies: [dealKey] }
  );

  // A little tick on the counter after every decision.
  useGSAP(
    () => {
      if (!counterRef.current || prefersReducedMotion()) return;
      gsap.fromTo(counterRef.current, { y: -6, scale: 1.15 }, { y: 0, scale: 1, duration: 0.4, ease: "back.out(3)" });
    },
    { dependencies: [sortedCount, maybe.length] }
  );

  const swipe = useCallback((dir: Direction) => {
    if (topRef.current && !topRef.current.fling(dir)) queued.current = dir;
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const dir: Direction | null =
        e.key === "ArrowLeft" ? "left" : e.key === "ArrowRight" ? "right" : e.key === "ArrowUp" ? "up" : null;
      if (dir) {
        e.preventDefault();
        if (e.repeat) return;
        swipe(dir);
      } else if (e.key === "Backspace" || (e.key === "z" && (e.metaKey || e.ctrlKey)) || e.key === "u") {
        e.preventDefault();
        actions.undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe]);

  if (!hydrated) return <div className="h-[26rem]" />;

  if (total === 0) {
    return (
      <Card reveal className="text-center">
        <p className="mb-4 text-lg">Your list is empty. Add a few things first.</p>
        <Button href="/list">Make a list</Button>
      </Card>
    );
  }

  if (!top) {
    const hasMaybes = maybe.length > 0;
    return (
      <Card reveal className="relative flex flex-col items-center gap-4 text-center">
        {celebrate && !hasMaybes ? <Confetti pieces={48} /> : null}
        <h2 className="font-title text-5xl uppercase">{hasMaybes ? "Almost there" : "All sorted"}</h2>
        <p className="text-lg">
          {hasMaybes
            ? `You're not sure about ${maybe.length} item${maybe.length === 1 ? "" : "s"}. Give them one more look?`
            : `You made a call on all ${total} items.`}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {hasMaybes ? (
            <Button onClick={() => setReviewingMaybes(true)}>Decide on maybes</Button>
          ) : null}
          <Button href="/results" variant={hasMaybes ? "secondary" : "primary"}>
            See results →
          </Button>
        </div>
        {canUndo ? (
          <Button variant="ghost" onClick={actions.undo}>
            Undo last
          </Button>
        ) : null}
      </Card>
    );
  }

  const decide = (id: string) => (choice: Choice) => {
    actions.decide(id, choice);
    setCelebrate(true);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p ref={counterRef} className="font-heading text-sm uppercase" aria-live="polite">
        {inMaybeRound
          ? `Maybes · ${maybe.length} left`
          : `${Math.min(sortedCount + 1, total)} of ${total}`}
      </p>

      <div ref={deckRef} className="relative h-[22rem] w-full max-w-md">
        {deck
          .slice(0, STACK)
          .reverse()
          .map((item) => {
            const depth = deck.indexOf(item);
            const isTop = depth === 0;
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={false}
                animate={{ scale: 1 - depth * 0.05, y: depth * 14 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                style={{ zIndex: STACK - depth, pointerEvents: isTop ? "auto" : "none" }}
                aria-hidden={!isTop}
              >
                {/* GSAP deals this wrapper in; Motion owns the card's own transform. */}
                <div className="deal absolute inset-0">
                  <SwipeCard
                    ref={isTop ? topRef : undefined}
                    item={item}
                    question={questionFor(item.id)}
                    allowMaybe={!inMaybeRound}
                    reducedMotion={reducedMotion}
                    onDecide={decide(item.id)}
                  />
                </div>
              </motion.div>
            );
          })}
      </div>

      <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-3">
        <DeckButton label="Let go" hint="←" tone="letgo" onClick={() => swipe("left")} />
        <DeckButton
          label="Maybe"
          hint="↑"
          tone="maybe"
          disabled={inMaybeRound}
          onClick={() => swipe("up")}
        />
        <DeckButton label="Keep" hint="→" tone="keep" onClick={() => swipe("right")} />
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Button variant="ghost" onClick={actions.undo} disabled={!canUndo}>
          ↶ Undo
        </Button>
        {sortedCount > 0 ? (
          <Button variant="ghost" href="/results">
            See results so far
          </Button>
        ) : null}
      </div>
      <p className="hidden text-sm opacity-70 sm:block">
        Drag the card, or use ← ↑ → on your keyboard. Backspace undoes.
      </p>
    </div>
  );
}

function DeckButton({
  label,
  hint,
  tone,
  onClick,
  disabled,
}: {
  label: string;
  hint: string;
  tone: "keep" | "letgo" | "maybe";
  onClick: () => void;
  disabled?: boolean;
}) {
  const tones = {
    keep: "border-keep text-keep",
    letgo: "border-letgo text-letgo",
    maybe: "border-maybe text-maybe",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-14 flex-col items-center justify-center border-2 bg-paper font-heading uppercase shadow-sm transition hover:bg-sand active:scale-95 disabled:opacity-30 ${tones[tone]}`}
    >
      <span aria-hidden className="text-lg leading-none">{hint}</span>
      {label}
    </button>
  );
}
