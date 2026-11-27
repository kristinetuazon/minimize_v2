"use client";

import { useRef } from "react";
import { LEVELS, altitudeFor, type Altitude } from "@/lib/balloon";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useStats } from "@/lib/store";
import { BAG_X, BalloonArt, Scenery, r2 } from "./art";

/** Current altitude plus how many sandbags (let-go items waiting) hang off the basket. */
export function useAltitude() {
  const stats = useStats();
  return {
    ...altitudeFor(stats),
    waiting: stats.waitingCount,
    hydrated: stats.hydrated,
  };
}

const MAX_BAGS = 5;

/*
 * The scene, drawn in thin art-deco lines. What's below the balloon changes
 * with altitude (rooftops → trees → clouds → peaks → aurora → stars → moon →
 * galaxy);
 * within a level the balloon climbs as progress grows. Stars also twinkle
 * faintly at night (see --stars in globals.css).
 */
export function BalloonScene({
  altitude,
  sandbags,
  className = "",
  label,
}: {
  altitude: Altitude;
  sandbags: number;
  className?: string;
  label?: string;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const balloon = useRef<SVGGElement>(null);
  const bob = useRef<SVGGElement>(null);
  const rig = useRef<SVGGElement>(null);
  const prevY = useRef<number | null>(null);
  const prevBags = useRef<number | null>(null);
  const level = altitude.level;
  const bags = Math.min(sandbags, MAX_BAGS);
  // Balloon height in the frame: low at the start of a level, high near the next.
  const y = 82 - altitude.progress * 72;

  // Gentle idle bob and sway.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(bob.current, {
        y: -5,
        rotation: 1.5,
        transformOrigin: "160px 100px",
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: svg },
  );

  // Rise (or settle) to the new height.
  useGSAP(
    () => {
      const from = prevY.current;
      prevY.current = y;
      if (from === null || prefersReducedMotion())
        return void gsap.set(balloon.current, { y });
      gsap.fromTo(
        balloon.current,
        { y: from },
        { y, duration: 1.4, ease: "power2.out" },
      );
    },
    { dependencies: [y] },
  );

  // A sandbag drops when a let-go item is ticked off.
  useGSAP(
    () => {
      const before = prevBags.current;
      prevBags.current = bags;
      if (
        before === null ||
        bags >= before ||
        prefersReducedMotion() ||
        !rig.current
      )
        return;
      for (let i = bags; i < before; i++) {
        const bag = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        const x = BAG_X[i] ?? 158;
        Object.entries({
          x: x - 3,
          y: 194,
          width: 7,
          height: 8,
          rx: 2,
          class: "fill-sand stroke-ink",
        }).forEach(([k, v]) => bag.setAttribute(k, String(v)));
        bag.setAttribute("stroke-width", "1.2");
        rig.current.appendChild(bag);
        gsap.to(bag, {
          y: 140,
          rotation: gsap.utils.random(-90, 90),
          transformOrigin: "center",
          opacity: 0,
          duration: 1.1,
          ease: "power2.in",
          onComplete: () => bag.remove(),
        });
      }
    },
    { dependencies: [bags] },
  );

  return (
    <svg
      ref={svg}
      viewBox="0 0 320 240"
      role="img"
      aria-label={
        label ??
        `Hot-air balloon at ${altitude.name}${sandbags ? `, ${sandbags} sandbags still to drop` : ""}`
      }
      className={`w-full overflow-hidden rounded-md border-2 border-ink/25 bg-gradient-to-b from-sand to-paper ${className}`}
      fill="none"
      stroke="var(--ink)"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Night stars (all levels) */}
      <g style={{ opacity: "var(--stars)" }} fill="var(--ink)" stroke="none">
        {[
          [24, 30],
          [70, 18],
          [120, 40],
          [210, 22],
          [260, 44],
          [296, 16],
          [40, 80],
          [284, 90],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" />
        ))}
      </g>

      {/* Deco sun rays, behind the scenery */}
      <g opacity="0.12" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => {
          const a = (Math.PI * (i + 1)) / 10;
          return (
            <line
              key={i}
              x1="160"
              y1="240"
              x2={r2(160 - Math.cos(a) * 320)}
              y2={r2(240 - Math.sin(a) * 320)}
            />
          );
        })}
      </g>

      <Scenery level={level} />

      <g ref={balloon}>
        <g ref={bob}>
          {/* The balloon is drawn at full size and scaled to 70% around the centre line. */}
          <g
            ref={rig}
            transform="translate(160 0) scale(0.7) translate(-160 0)"
          >
            <BalloonArt bags={bags} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Altitude name, progress to the next level, and the "let go to rise" hint. */
export function AltitudeCaption({
  altitude,
  waiting,
}: {
  altitude: Altitude;
  waiting: number;
}) {
  return (
    <div className="mt-3 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-title text-2xl leading-none">{altitude.name}</p>
        <p className="text-xs opacity-70">
          {altitude.next
            ? `${altitude.toNext} to ${altitude.next.name.toLowerCase()}`
            : "As high as it goes ✨"}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-700"
          style={{ width: `${altitude.progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm opacity-75">
        {waiting > 0
          ? `${waiting} sandbag${waiting === 1 ? "" : "s"} to drop: tick off let-go items to rise.`
          : "Let go of things to rise."}
      </p>
    </div>
  );
}

export { LEVELS, Scenery };

/** A compact altitude readout with a tiny balloon that hops whenever you gain lift. */
export function AltitudeMeter() {
  const altitude = useAltitude();
  const icon = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (!altitude.hydrated || prefersReducedMotion()) return;
      gsap.fromTo(icon.current, { y: 0 }, { y: -6, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 1 });
    },
    { dependencies: [altitude.lift] }
  );
  if (!altitude.hydrated) return null;
  return (
    <div className="flex items-start gap-3">
      <svg ref={icon} viewBox="0 0 24 32" className="mt-1 h-10 w-8 shrink-0" fill="none" stroke="var(--ink)" strokeWidth="1.4" aria-hidden>
        <path d="M12 2c6 0 9 4.5 9 9.5 0 4.5-3.5 8-6 10.5h-6C6.5 19.5 3 16 3 11.5 3 6.5 6 2 12 2z" fill="var(--card)" />
        <path d="M12 2c-2.5 3-3 9-2 20M12 2c2.5 3 3 9 2 20M9 22l1 4M15 22l-1 4" />
        <rect x="9" y="26" width="6" height="4" rx="1" fill="var(--paper)" />
      </svg>
      <div className="min-w-0 flex-1">
        <AltitudeCaption altitude={altitude} waiting={altitude.waiting} />
      </div>
    </div>
  );
}
