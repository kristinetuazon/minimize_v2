"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useImperativeHandle, useRef } from "react";
import type { Choice } from "@/lib/types";

export type Direction = "left" | "right" | "up";
export type SwipeCardHandle = {
  /** Returns false if the card is already leaving (or the direction isn't allowed). */
  fling: (dir: Direction) => boolean;
};

const CHOICE: Record<Direction, Choice> = { left: "letgo", right: "keep", up: "maybe" };
const DISTANCE = 120; // px of drag that counts as a decision
const VELOCITY = 600; // px/s flick that counts as a decision

type Props = {
  name: string;
  question: string;
  allowMaybe: boolean;
  reducedMotion: boolean;
  onDecide: (choice: Choice) => void;
  ref?: React.Ref<SwipeCardHandle>;
};

export function SwipeCard({ name, question, allowMaybe, reducedMotion, onDecide, ref }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const busy = useRef(false);

  const rotate = useTransform(x, [-300, 300], [-16, 16]);
  const keepOpacity = useTransform(x, [20, DISTANCE], [0, 1]);
  const letgoOpacity = useTransform(x, [-DISTANCE, -20], [1, 0]);
  const maybeOpacity = useTransform(y, [-DISTANCE, -20], [allowMaybe ? 1 : 0, 0]);

  function fling(dir: Direction): boolean {
    if (busy.current) return false;
    if (dir === "up" && !allowMaybe) return false;
    busy.current = true;
    void flyOut(dir);
    return true;
  }

  async function flyOut(dir: Direction) {
    if (typeof navigator !== "undefined") navigator.vibrate?.(12);

    if (!reducedMotion) {
      const w = typeof window === "undefined" ? 800 : window.innerWidth;
      const opts = { duration: 0.28, ease: "easeIn" } as const;
      await Promise.all([
        animate(x, dir === "right" ? w : dir === "left" ? -w : x.get(), opts),
        animate(y, dir === "up" ? -window.innerHeight : y.get() + 40, opts),
      ]);
    }
    onDecide(CHOICE[dir]);
  }

  useImperativeHandle(ref, () => ({ fling }));

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    const horizontal = Math.abs(offset.x) >= Math.abs(offset.y);
    if (horizontal && (offset.x > DISTANCE || velocity.x > VELOCITY)) return void fling("right");
    if (horizontal && (offset.x < -DISTANCE || velocity.x < -VELOCITY)) return void fling("left");
    if (allowMaybe && !horizontal && (offset.y < -DISTANCE || velocity.y < -VELOCITY))
      return void fling("up");
    const spring = { type: "spring", stiffness: 500, damping: 30 } as const;
    animate(x, 0, spring);
    animate(y, 0, spring);
  }

  return (
    <motion.div
      role="group"
      aria-roledescription="card"
      aria-label={name}
      drag
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ x, y, rotate, touchAction: "none" }}
      whileDrag={{ cursor: "grabbing" }}
      className="absolute inset-0 cursor-grab select-none"
    >
      <div className="relative flex h-full flex-col justify-between overflow-hidden border-2 border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
        {/* Tints + stamps that fade in with the drag */}
        <motion.div style={{ opacity: keepOpacity }} className="pointer-events-none absolute inset-0 bg-keep/25" />
        <motion.div style={{ opacity: letgoOpacity }} className="pointer-events-none absolute inset-0 bg-letgo/25" />
        <motion.div style={{ opacity: maybeOpacity }} className="pointer-events-none absolute inset-0 bg-maybe/25" />
        <Stamp opacity={keepOpacity} className="top-6 left-6 -rotate-12 border-keep text-keep">
          Keep
        </Stamp>
        <Stamp opacity={letgoOpacity} className="top-6 right-6 rotate-12 border-letgo text-letgo">
          Let go
        </Stamp>
        <Stamp opacity={maybeOpacity} className="bottom-6 left-1/2 -translate-x-1/2 border-maybe text-maybe">
          Maybe
        </Stamp>

        <h2 className="relative mt-10 text-right font-title text-[clamp(2.5rem,10vw,3.75rem)] leading-none break-words uppercase">
          {name}
        </h2>
        <p className="relative text-center text-lg italic">{question}</p>
      </div>
    </motion.div>
  );
}

function Stamp({
  children,
  opacity,
  className,
}: {
  children: React.ReactNode;
  opacity: ReturnType<typeof useTransform<number, number>>;
  className: string;
}) {
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className={`pointer-events-none absolute rounded-md border-4 bg-paper/80 px-3 py-1 font-heading text-2xl uppercase ${className}`}
    >
      {children}
    </motion.span>
  );
}
