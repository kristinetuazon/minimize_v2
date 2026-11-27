"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { isComplete, summarize } from "@/lib/store";
import type { ListState } from "@/lib/types";
import { BalloonArt } from "./art";

const MAX = 8;
const SCALE = 0.32;
const H = 150; // sky height in drawing units; the width follows the container

/** 0 = nothing done, 1 = fully sorted and every let-go item gone. */
function completion(list: ListState) {
  const { undecided, letgo, handled } = summarize(list);
  const total = list.items.length;
  if (total === 0) return 0;
  const sorted = (total - undecided.length) / total;
  const gone = letgo.length ? handled / letgo.length : sorted === 1 ? 1 : 0;
  return sorted * 0.6 + gone * 0.4;
}

/**
 * Every list as its own balloon in one sky: the further along a list is, the
 * higher it floats. Waiting let-go items hang as sandbags; the current list
 * flies a pennant. Click a balloon to open that list.
 */
export function Fleet({
  lists,
  currentId,
  highlightId,
  onHover,
  onOpen,
}: {
  lists: ListState[];
  currentId: string | null;
  /** The list being hovered (here or in the rows below): it gets the pennant and a ring. */
  highlightId?: string | null;
  onHover?: (id: string | null) => void;
  onOpen: (list: ListState) => void;
}) {
  const flagId = highlightId ?? currentId;
  const ref = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const shown = lists.slice(0, MAX);
  // Keep a fixed on-screen height and widen the drawing to match the window,
  // so balloons stay the same size instead of the sky growing taller.
  const [W, setW] = useState(320);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      if (height > 0) setW(Math.max(240, Math.round((width / height) * H)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils
        .toArray<SVGGElement>(".fleet-bob", ref.current)
        .forEach((el, i) => {
          gsap.to(el, {
            y: -4,
            duration: 2 + (i % 3) * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.3,
          });
        });
    },
    { scope: ref, dependencies: [shown.length] },
  );

  if (shown.length === 0) return null;

  return (
    <div
      ref={box}
      className="h-56 w-full overflow-hidden rounded-md border-2 border-ink/20 bg-gradient-to-b from-sand to-paper lg:h-64"
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="size-full"
        fill="none"
        stroke="var(--ink)"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="group"
        aria-label="Your lists as balloons: higher means further along"
      >
        {/* Deco rays, a cloud, the ground */}
        <g opacity="0.1" strokeWidth="0.6">
          {[-120, -80, -40, 0, 40, 80, 120].map((d) => (
            <line
              key={d}
              x1={W / 2}
              y1="140"
              x2={W / 2 + d * 2.2 * (W / 320)}
              y2="0"
            />
          ))}
        </g>
        <path
          transform={`translate(${W * 0.78 - 248} 0)`}
          d="M248 22c0-5 4-8 9-7 2-4 7-6 11-3 3-3 9-1 10 4 4 0 7 3 6 6z"
          fill="var(--paper)"
          strokeWidth="0.9"
        />
        <path
          transform={`translate(${W * 0.07 - 22} 0)`}
          d="M22 30c0-4 3-6 7-5 2-3 5-4 8-2 2-2 7-1 7 3 3 0 5 2 4 4z"
          fill="var(--paper)"
          strokeWidth="0.8"
        />
        <path d={`M0 140h${W}`} strokeWidth="1.2" />

        {shown.map((list, i) => {
          const { letgo, handled } = summarize(list);
          const c = completion(list);
          const x = ((i + 0.5) / shown.length) * W;
          // Basket bottom sits on the ground at 0%, high in the sky at 100%.
          const basketY = 138 - c * 74;
          const name = list.listName || "Untitled";
          const label = name.length > 12 ? `${name.slice(0, 11)}…` : name;
          const pct = Math.round(c * 100);
          return (
            <g
              key={list.id}
              role="link"
              tabIndex={0}
              aria-label={`${name}: ${pct}% of the way`}
              className="cursor-pointer outline-none [&:focus-visible_.fleet-ring]:opacity-100"
              onClick={() => onOpen(list)}
              onMouseEnter={() => onHover?.(list.id)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(list.id)}
              onBlur={() => onHover?.(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(list);
                }
              }}
            >
              <g className="fleet-bob">
                {/* BalloonArt's basket bottom is at y≈191; scale around the centre line. */}
                <g
                  transform={`translate(${x - 160 * SCALE} ${basketY - 191 * SCALE}) scale(${SCALE})`}
                >
                  <circle
                    className="fleet-ring"
                    cx="160"
                    cy="80"
                    r="66"
                    stroke="var(--ink)"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    opacity={list.id === highlightId ? 1 : 0}
                  />
                  <BalloonArt bags={Math.min(letgo.length - handled, 3)} />
                  {/* Finished lists sparkle */}
                  {isComplete(list) ? (
                    <path
                      d="M222 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4zM96 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
                      fill="var(--maybe)"
                      stroke="var(--ink)"
                      strokeWidth="1.5"
                    />
                  ) : null}
                  {list.id === flagId ? (
                    <g>
                      <path d="M160 22v-26" strokeWidth="2.4" />
                      <path
                        d="M160 -4l22 7-22 7z"
                        fill="var(--maybe)"
                        strokeWidth="2"
                      />
                    </g>
                  ) : null}
                </g>
                <text
                  x={x}
                  y={Math.min(basketY + 11, 149)}
                  textAnchor="middle"
                  fontSize="7"
                  fill="var(--ink)"
                  stroke="none"
                  className="font-heading uppercase"
                >
                  {label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
