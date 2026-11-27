"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { BalloonArt, Scenery, r2 } from "./art";
import { useAltitude } from "./Balloon";

const MAX_BAGS = 5;

/**
 * Home's full-page backdrop, showing where your balloon is: the sky deepens
 * and the scenery changes with your altitude (rooftops → … → galaxy), clouds
 * drift, and the balloon climbs as you near the next level, carrying a
 * sandbag for each let-go item still waiting.
 */
export function HomeSky() {
  const altitude = useAltitude();
  const root = useRef<HTMLDivElement>(null);
  const balloon = useRef<HTMLDivElement>(null);
  const bob = useRef<SVGSVGElement>(null);
  const prevRise = useRef<number | null>(null);
  const level = altitude.hydrated ? altitude.level : 0;
  const bags = altitude.hydrated ? Math.min(altitude.waiting, MAX_BAGS) : 0;
  // 0..1: how far through this level you are; the balloon climbs with it.
  const rise = altitude.hydrated ? altitude.progress : 0;
  // The sky deepens as you climb (kept light enough for dark text by day).
  const depth = Math.min(level, 8) * 3;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(bob.current, {
        y: -10,
        rotation: 2,
        transformOrigin: "50% 80%",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.utils
        .toArray<SVGElement>(".sky-cloud", root.current)
        .forEach((cloud, i) => {
          gsap.fromTo(
            cloud,
            { xPercent: -30 },
            {
              xPercent: 30,
              duration: 28 + i * 9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: -i * 5,
            },
          );
        });
    },
    { scope: root },
  );

  // Climb (or settle) smoothly when progress changes.
  useGSAP(
    () => {
      const from = prevRise.current;
      prevRise.current = rise;
      if (from === null || prefersReducedMotion())
        return void gsap.set(balloon.current, { "--rise": rise });
      gsap.fromTo(
        balloon.current,
        { "--rise": from },
        { "--rise": rise, duration: 2, ease: "power2.out" },
      );
    },
    { dependencies: [rise] },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 320 240"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        stroke="var(--ink)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="home-sky" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor={`color-mix(in oklab, var(--ink) ${depth}%, var(--sand))`}
            />
            <stop offset="1" stopColor="var(--bg)" />
          </linearGradient>
        </defs>
        <rect
          x="-400"
          y="-400"
          width="1120"
          height="640"
          fill="url(#home-sky)"
          stroke="none"
        />
        {/* Deco sun rays */}
        <g className="sky-art" opacity="0.1" strokeWidth="0.8">
          {Array.from({ length: 17 }, (_, i) => {
            const a = (Math.PI * (i + 1)) / 18;
            return (
              <line
                key={i}
                x1="160"
                y1="240"
                x2={r2(160 - Math.cos(a) * 600)}
                y2={r2(240 - Math.sin(a) * 600)}
              />
            );
          })}
        </g>
        {/* Night stars at every altitude */}
        <g style={{ opacity: "var(--stars)" }} fill="var(--ink)" stroke="none">
          {Array.from({ length: 30 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 71) % 320}
              cy={(i * 43) % 150}
              r={i % 6 === 0 ? 0.9 : 0.5}
            />
          ))}
        </g>
        {/* What's below you, anchored to the bottom, with fine lines however big the page is */}
        <g className="sky-art">
          <Scenery level={level} part="ground" />
        </g>
      </svg>

      {/* What's up in the air (sun, clouds, birds, stars, moon, galaxy), laid out below the header */}
      <svg
        className="absolute inset-x-0 top-16 h-[55%] w-full"
        viewBox="0 0 320 130"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        stroke="var(--ink)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g className="sky-art">
          <Scenery level={level} part="sky" />
        </g>
      </svg>

      {/* Slow drifting clouds */}
      {[
        "left-[4%] top-[24%] w-28",
        "right-[24%] top-[16%] w-20",
        "left-[28%] top-[46%] w-16",
      ].map((cls) => (
        <svg
          key={cls}
          className={`sky-cloud absolute hidden opacity-60 sm:block ${cls}`}
          viewBox="0 0 44 16"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="0.8"
        >
          <path d="M1 14c0-5 4-8 9-7 2-4 7-6 11-3 3-3 9-1 10 4 4 0 7 3 6 6z" />
        </svg>
      ))}

      {/* The balloon: small above the title on phones, big on the right on wider screens */}
      <div
        ref={balloon}
        className="absolute top-[calc(1.1rem-var(--rise)*0.3rem)] left-1/2 w-9 -translate-x-1/2 sm:top-[calc(58%-var(--rise)*40%)] sm:right-[10%] sm:left-auto sm:w-40 sm:translate-x-0 lg:w-56"
        style={{ "--rise": rise } as React.CSSProperties}
      >
        <svg
          ref={bob}
          viewBox="96 18 128 190"
          className="w-full overflow-visible"
        >
          <BalloonArt bags={bags} />
        </svg>
      </div>
    </div>
  );
}
