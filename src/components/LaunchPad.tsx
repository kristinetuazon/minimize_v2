"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import type { Item } from "@/lib/types";
import { BalloonArt } from "./art";

/** Spots on the ground for parcels: a pile either side of the basket. */
const SPOTS: [number, number, number][] = [
  // x, y (bottom of parcel), size
  [128, 208, 20], [192, 208, 20], [106, 208, 18], [214, 208, 17], [118, 191, 15], [202, 191, 15],
  [90, 208, 14], [232, 208, 13], [100, 193, 12], [222, 193, 12], [134, 191, 11], [186, 191, 11],
  [96, 182, 10], [212, 180, 10],
];
const FILLS = ["var(--sand)", "var(--paper)", "color-mix(in oklab, var(--card) 70%, var(--paper))"];

/**
 * The list page's scene: the balloon tethered on the ground, a parcel on the
 * pile for every item you add, and the envelope filling out as you load it.
 */
export function LaunchPad({ items, limit }: { items: Item[]; limit?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const envelope = useRef<SVGGElement>(null);
  const seen = useRef<Set<string> | null>(null);
  const shown = items.slice(0, SPOTS.length);
  const extra = items.length - shown.length;
  // Inflates from 70% to full size over the first ten items.
  const inflate = 0.7 + Math.min(items.length, 10) * 0.03;

  // New parcels drop onto the pile; the envelope swells.
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      if (envelope.current) {
        if (reduce) gsap.set(envelope.current, { scale: inflate, transformOrigin: "160px 190px" });
        else gsap.to(envelope.current, { scale: inflate, transformOrigin: "160px 190px", duration: 0.8, ease: "elastic.out(1, 0.5)" });
      }
      const previous = seen.current;
      seen.current = new Set(items.map((i) => i.id));
      if (!previous || reduce || !ref.current) return;
      const fresh = shown.filter((i) => !previous.has(i.id)).map((i) => ref.current!.querySelector(`[data-parcel="${i.id}"]`));
      gsap.from(fresh.filter(Boolean), { y: -90, opacity: 0, duration: 0.7, ease: "bounce.out", stagger: 0.06 });
    },
    { dependencies: [items.length, inflate] }
  );

  const aboard = items.length;
  const caption =
    aboard === 0
      ? "The basket's empty. Add the things you want to sort."
      : `${aboard} item${aboard === 1 ? "" : "s"} aboard${limit ? ` · room to keep ${limit}` : ""} · ready for lift-off`;

  return (
    <figure className="rounded-md border-2 border-ink/20 bg-gradient-to-b from-sand to-paper p-2">
      <svg
        ref={ref}
        viewBox="80 20 160 200"
        className="mx-auto block h-56 w-full"
        fill="none"
        stroke="var(--ink)"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={caption}
      >
        {/* Deco rays */}
        <g opacity="0.1" strokeWidth="0.8">
          {[-60, -40, -20, 0, 20, 40, 60].map((d) => (
            <line key={d} x1="160" y1="210" x2={160 + d * 3} y2="20" />
          ))}
        </g>
        {/* A cloud and birds */}
        <path d="M200 52c0-5 4-8 9-7 2-4 7-6 11-3 3-3 9-1 10 4 4 0 7 3 6 6z" fill="var(--paper)" strokeWidth="1" />
        <path d="M100 60q3-3 6 0 3-3 6 0M112 52q2-2 4 0 2-2 4 0" strokeWidth="0.8" />

        {/* Ground with grass tufts */}
        <path d="M80 208h160" strokeWidth="1.4" />
        <path d="M86 208l2-4 2 4M232 208l2-5 2 5M150 208l1-3 1 3M228 208l1-3 1 3" strokeWidth="0.8" />

        {/* Tethers to stakes */}
        <path d="M148 186l-26 22M172 186l26 22" strokeWidth="0.8" strokeDasharray="2 2" />
        <path d="M120 206v5M198 206v5" strokeWidth="1.4" />

        {/* The balloon, resting its basket on the ground */}
        <g ref={envelope}>
          <g transform="translate(0 17)">
            <BalloonArt />
          </g>
        </g>

        {/* Parcels: one per item */}
        {shown.map((item, i) => {
          const [x, y, s] = SPOTS[i]!;
          return (
            <g key={item.id} data-parcel={item.id}>
              <rect x={x - s / 2} y={y - s * 0.8} width={s} height={s * 0.8} rx="1" fill={FILLS[i % FILLS.length]} strokeWidth="1" />
              <path d={`M${x} ${y - s * 0.8}v${s * 0.8}M${x - s / 2} ${y - s * 0.45}h${s}`} strokeWidth="0.6" />
            </g>
          );
        })}
        {extra > 0 ? (
          <text x="232" y="190" textAnchor="end" fontSize="9" fill="var(--ink)" stroke="none" className="font-heading">
            +{extra}
          </text>
        ) : null}
      </svg>
      <figcaption className="px-2 pb-1 text-center text-sm">{caption}</figcaption>
    </figure>
  );
}
