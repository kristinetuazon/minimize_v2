"use client";

import { useId } from "react";

/*
 * The illustrations, drawn as thin art-deco line work in the app palette.
 * Everything uses CSS variables, so day and night mode both work.
 *
 * Coordinates: the balloon lives around x 96–224, y 18–206 (centre x 160);
 * the scenery fills a 320 × 240 frame.
 */

const ENVELOPE =
  "M160 22c34 0 54 26 54 56 0 26-20 46-36 62l-4 8h-28l-4-8c-16-16-36-36-36-62 0-30 20-56 54-56z";
export const BAG_X = [150, 158, 166, 174, 142];

/** The hot-air balloon with striped panels, deco bands, basket and sandbags. */
export function BalloonArt({ bags = 0 }: { bags?: number }) {
  const clip = useId();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <clipPath id={clip}>
          <path d={ENVELOPE} />
        </clipPath>
      </defs>

      {/* Envelope base */}
      <path d={ENVELOPE} fill="var(--card)" stroke="none" />
      <g clipPath={`url(#${clip})`}>
        {/* Alternating panels */}
        <path
          d="M160 22C138 40 128 100 140 148h12C147 100 150 44 160 22z"
          fill="var(--paper)"
          stroke="none"
        />
        <path
          d="M160 22c22 18 32 78 20 126h-12c5-48 2-104-8-126z"
          fill="var(--paper)"
          stroke="none"
        />
        {/* Crown band with a zigzag */}
        <path
          d="M96 46h128v10H96z"
          fill="var(--ink)"
          stroke="none"
          opacity="0.85"
        />
        <path
          d="M96 51l6-4 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8"
          stroke="var(--maybe)"
          strokeWidth="1"
        />
        {/* Belt with dots */}
        <path
          d="M96 108c30 10 98 10 128 0v9c-30 10-98 10-128 0z"
          fill="var(--ink)"
          stroke="none"
          opacity="0.85"
        />
        {[118, 130, 142, 154, 166, 178, 190, 202].map((x) => (
          <circle
            key={x}
            cx={x}
            cy={113 + Math.abs(160 - x) * -0.02}
            r="1.3"
            fill="var(--paper)"
            stroke="none"
          />
        ))}
        {/* Shading on the right */}
        <g stroke="var(--ink)" strokeWidth="0.8" opacity="0.3">
          {[0, 7, 14, 21, 28, 35, 42].map((d) => (
            <path key={d} d={`M${206 - d * 0.2} ${60 + d}l10 -10`} />
          ))}
        </g>
      </g>
      {/* Gore lines and outline */}
      <path
        d="M160 22C138 40 128 100 140 148M160 22c-10 22-13 78-8 126M160 22v126M160 22c10 22 13 78 8 126M160 22c22 18 32 78 20 126"
        stroke="var(--ink)"
        strokeWidth="1"
      />
      <path d={ENVELOPE} fill="none" stroke="var(--ink)" strokeWidth="2.2" />

      {/* Skirt */}
      <path
        d="M142 148h36l-4 8h-28z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="1.4"
      />
      <path
        d="M150 148l1 8M160 148v8M170 148l-1 8"
        stroke="var(--ink)"
        strokeWidth="0.8"
      />
      {/* Burner flame */}
      <path
        d="M160 170c-4-4-3-9 0-13 3 4 4 9 0 13z"
        fill="var(--maybe)"
        stroke="var(--ink)"
        strokeWidth="0.9"
      />
      {/* Ropes */}
      <path
        d="M146 156l3 18M152 156l1 18M168 156l-1 18M174 156l-3 18"
        stroke="var(--ink)"
        strokeWidth="0.9"
      />
      {/* Basket with a woven pattern */}
      <rect
        x="147"
        y="174"
        width="26"
        height="17"
        rx="2"
        fill="var(--sand)"
        stroke="var(--ink)"
        strokeWidth="1.8"
      />
      <path d="M147 178h26" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M147 184.5h26" stroke="var(--ink)" strokeWidth="0.6" />
      {[151, 155, 159, 163, 167, 171].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${i % 2 ? 179 : 185.5}v4`}
          stroke="var(--ink)"
          strokeWidth="0.6"
        />
      ))}

      {/* Sandbags still to drop */}
      {Array.from({ length: bags }, (_, i) => {
        const x = BAG_X[i]!;
        return (
          <g key={i} stroke="var(--ink)">
            <path d={`M${x} 191v4`} strokeWidth="0.8" />
            <path
              d={`M${x - 3.5} 199c0-3 1.5-4 3.5-4s3.5 1 3.5 4v3c0 1-1 2-3.5 2s-3.5-1-3.5-2z`}
              fill="var(--sand)"
              strokeWidth="1"
            />
            <path d={`M${x - 2} 197h4`} strokeWidth="0.6" />
          </g>
        );
      })}
    </g>
  );
}

const cloudPath = "M0 14c0-6 5-10 11-9 2-5 8-7 13-4 4-3 11-1 12 5 5 0 8 4 7 8z";

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={cloudPath}
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth={1.3 / s}
      />
      {/* Inner curls */}
      <path
        d="M9 10c1-2 3-3 5-2M22 7c1-2 3-2 5-1"
        stroke="var(--ink)"
        strokeWidth={0.7 / s}
        opacity="0.6"
      />
    </g>
  );
}

function Birds({ x, y }: { x: number; y: number }) {
  return (
    <g
      stroke="var(--ink)"
      strokeWidth="0.9"
      fill="none"
      transform={`translate(${x} ${y})`}
    >
      <path d="M0 0q3-3 6 0 3-3 6 0" />
      <path d="M14 -6q2-2 4 0 2-2 4 0" />
      <path d="M8 8q2-2 4 0 2-2 4 0" />
    </g>
  );
}

function Sparkle({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return (
    <path
      d={`M${x} ${y - r}L${x + r * 0.25} ${y - r * 0.25} ${x + r} ${y} ${x + r * 0.25} ${y + r * 0.25} ${x} ${y + r} ${x - r * 0.25} ${y + r * 0.25} ${x - r} ${y} ${x - r * 0.25} ${y - r * 0.25}z`}
      fill="var(--ink)"
      stroke="none"
    />
  );
}

const STARS: [number, number, number][] = [
  [18, 22, 0.8],
  [44, 60, 0.6],
  [70, 14, 1],
  [102, 44, 0.6],
  [132, 18, 0.8],
  [196, 30, 0.6],
  [224, 12, 1],
  [250, 54, 0.6],
  [286, 24, 0.9],
  [306, 70, 0.6],
  [28, 104, 0.6],
  [292, 120, 0.7],
  [60, 140, 0.5],
  [270, 160, 0.5],
  [12, 170, 0.6],
  [310, 190, 0.5],
];

function StarField({ sparkles = true }: { sparkles?: boolean }) {
  return (
    <g>
      {STARS.map(([x, y, r]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill="var(--ink)"
          stroke="none"
        />
      ))}
      {sparkles ? (
        <>
          <Sparkle x={86} y={84} r={4} />
          <Sparkle x={238} y={96} r={3} />
          <Sparkle x={300} y={40} r={3.5} />
          <Sparkle x={40} y={36} r={2.5} />
        </>
      ) : null}
    </g>
  );
}

function CloudSea({ y = 214 }: { y?: number }) {
  const scallops = Array.from({ length: 7 }, () => "c10-12 30-12 40 0").join(
    " ",
  );
  return (
    <g>
      <path
        d={`M-20 ${y + 6}c10-12 30-12 40 0 ${scallops} c10-12 30-12 40 0V250H-20z`}
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="1.3"
      />
      <path
        d={`M-10 ${y + 18}c10-10 26-10 36 0 m30 0c10-10 26-10 36 0 m30 0c10-10 26-10 36 0 m30 0c10-10 26-10 36 0`}
        stroke="var(--ink)"
        strokeWidth="0.7"
        opacity="0.5"
      />
    </g>
  );
}

/** What's below (and around) the balloon at each altitude level. */
export function Scenery({
  level,
  part = "all",
}: {
  level: number;
  part?: "all" | "sky" | "ground";
}) {
  // "sky" = things up in the air (sun, clouds, birds, stars…), "ground" = what's below you.
  const sky = part !== "ground";
  const ground = part !== "sky";
  switch (level) {
    case 0: // Rooftops: a little town with chimneys, smoke and a spire
      return (
        <g stroke="var(--ink)" strokeWidth="1.3" fill="var(--paper)">
          {sky ? (
            <>
              <Cloud x={226} y={34} s={0.9} />
              <Birds x={70} y={60} />
            </>
          ) : null}
          {ground ? (
            <>
              {/* Smoke */}
              <path
                d="M33 178c-4-6 4-8 0-14s4-8 0-14M262 170c-4-6 4-8 0-14s4-8 0-14"
                fill="none"
                strokeWidth="0.9"
                opacity="0.6"
              />
              {/* Houses */}
              <path d="M0 240v-30h22v-12l14-14 14 14v42z" />
              <path d="M30 186v-10h6v16" />
              <path d="M50 240v-38h34v38z" />
              <path d="M84 240v-24l18-16 18 16v24z" />
              <path d="M120 240v-18h34v18z" />
              {/* Spire */}
              <path d="M186 240v-36l10-26 10 26v36z" />
              <path d="M196 178v-8M193 173h6" fill="none" />
              <path d="M206 240v-28h30v28z" />
              <path d="M236 240v-32h22l12-14 12 14v32z" />
              <path d="M258 180v-12h6v14" />
              <path d="M282 240v-22h40v22z" />
              {/* Windows and doors */}
              <g strokeWidth="0.9" fill="var(--maybe)" opacity="0.9">
                {[
                  [8, 216],
                  [58, 210],
                  [70, 210],
                  [58, 224],
                  [96, 220],
                  [128, 226],
                  [212, 218],
                  [224, 218],
                  [246, 214],
                  [290, 224],
                  [302, 224],
                ].map(([x, y]) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" />
                ))}
              </g>
              <path
                d="M104 240v-10h-6v10M200 240v-12a4 4 0 0 0-8 0v12M272 240v-10h-6v10"
                strokeWidth="0.9"
                fill="none"
              />
              <path d="M60 202h14M210 212h22" strokeWidth="0.7" fill="none" />
            </>
          ) : null}
        </g>
      );
    case 1: // Treetops: layered crowns and birds
      return (
        <g stroke="var(--ink)" strokeWidth="1.3">
          {sky ? (
            <>
              <Cloud x={24} y={46} s={0.9} />
              <Cloud x={240} y={26} s={0.7} />
              <Birds x={200} y={80} />
            </>
          ) : null}
          {ground &&
            (
              [
                [10, 238, 26],
                [52, 232, 22],
                [92, 240, 26],
                [226, 240, 26],
                [266, 230, 24],
                [306, 238, 22],
              ] as const
            ).map(([x, y, r], i) => (
              <g key={x}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={
                    i % 2
                      ? "var(--paper)"
                      : "color-mix(in oklab, var(--keep) 25%, var(--paper))"
                  }
                />
                {/* Foliage marks */}
                <path
                  d={`M${x - r * 0.5} ${y - r * 0.4}q${r * 0.25}-${r * 0.3} ${r * 0.5} 0M${x} ${y - r * 0.7}q${r * 0.25}-${r * 0.3} ${r * 0.5} 0M${x - r * 0.2} ${y - r * 0.05}q${r * 0.25}-${r * 0.3} ${r * 0.5} 0`}
                  strokeWidth="0.8"
                  fill="none"
                />
              </g>
            ))}
        </g>
      );
    case 2: // Low clouds, drifting around
      return (
        <g>
          {ground ? (
            <>
              <Cloud x={6} y={150} s={1.5} />
              <Cloud x={214} y={168} s={1.7} />
              <Birds x={120} y={190} />
            </>
          ) : null}
          {sky ? (
            <>
              <Cloud x={236} y={46} s={1} />
              <Cloud x={26} y={36} s={0.8} />
            </>
          ) : null}
        </g>
      );
    case 3: // High clouds: a sea of cloud, sun with rays
      return (
        <g>
          {sky ? (
            <>
              <g stroke="var(--maybe)" strokeWidth="1.2">
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (Math.PI * 2 * i) / 12;
                  return (
                    <line
                      key={i}
                      x1={r2(56 + Math.cos(a) * 21)}
                      y1={r2(48 + Math.sin(a) * 21)}
                      x2={r2(56 + Math.cos(a) * 28)}
                      y2={r2(48 + Math.sin(a) * 28)}
                    />
                  );
                })}
              </g>
              <circle
                cx="56"
                cy="48"
                r="16"
                fill="color-mix(in oklab, var(--maybe) 30%, var(--paper))"
                stroke="var(--ink)"
                strokeWidth="1.3"
              />
              <Cloud x={240} y={70} s={0.8} />
            </>
          ) : null}
          {ground ? <CloudSea y={206} /> : null}
        </g>
      );
    case 4: // Mountain peaks with snow caps through the clouds
      if (!ground) return null;
      return (
        <g stroke="var(--ink)" strokeWidth="1.3">
          <path d="M-10 240l56-82 30 40 42-70 46 112z" fill="var(--paper)" />
          <path d="M186 240l58-92 34 52 50-48v88z" fill="var(--paper)" />
          {/* Snow caps */}
          <path
            d="M108 128l-10 16 6-2 4 6 4-6 6 3z"
            fill="var(--paper)"
            strokeWidth="1"
          />
          <path
            d="M244 148l-10 16 6-2 4 5 4-5 6 2zM36 172l10-14 9 14-5-2-4 4-4-4z"
            fill="var(--paper)"
            strokeWidth="1"
          />
          {/* Ridge hatching */}
          <g strokeWidth="0.7" opacity="0.5">
            <path d="M118 150l12 24M124 150l12 26M130 152l12 28M256 166l10 20M262 168l10 22M268 172l8 18M50 172l8 14M56 176l8 14" />
          </g>
          <CloudSea y={214} />
        </g>
      );
    case 5: // Aurora curtains
      return (
        <g>
          {sky ? <StarField sparkles={false} /> : null}
          {sky &&
            [
              [
                "M-10 40c40 20 80-14 120 6s80 20 120-6 60-10 100 0",
                "var(--keep)",
                1,
              ],
              [
                "M-10 58c40 20 80-14 120 6s80 20 120-6 60-10 100 0",
                "var(--keep)",
                0.6,
              ],
              [
                "M-10 76c40 20 80-14 120 6s80 20 120-6 60-10 100 0",
                "var(--maybe)",
                0.5,
              ],
            ].map(([d, c, o]) => (
              <path
                key={d as string}
                d={d as string}
                stroke={c as string}
                strokeWidth="1.5"
                opacity={o as number}
                fill="none"
              />
            ))}
          {/* Curtain streaks */}
          {sky ? (
            <g stroke="var(--keep)" strokeWidth="0.8" opacity="0.35">
              {Array.from({ length: 22 }, (_, i) => (
                <path
                  key={i}
                  d={`M${i * 15} ${r2(44 + Math.sin(i) * 8)}v${26 + (i % 3) * 8}`}
                />
              ))}
            </g>
          ) : null}
          {ground ? <CloudSea y={222} /> : null}
        </g>
      );
    case 6: // The stars, with a shooting star
      if (!sky) return null;
      return (
        <g>
          <StarField />
          <path d="M40 120l60-26" stroke="var(--ink)" strokeWidth="1.2" />
          <path
            d="M40 120l40-17"
            stroke="var(--maybe)"
            strokeWidth="2.5"
            opacity="0.4"
          />
          <Sparkle x={100} y={94} r={4} />
        </g>
      );
    case 7: // The moon, with craters
      if (!sky) return null;
      return (
        <g>
          <StarField />
          <circle
            cx="262"
            cy="56"
            r="24"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="1.4"
          />
          <circle
            cx="254"
            cy="50"
            r="5"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.9"
          />
          <circle
            cx="270"
            cy="66"
            r="3.5"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.9"
          />
          <circle
            cx="268"
            cy="44"
            r="2"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.8"
          />
          <path
            d="M248 72a24 24 0 0 0 30-2"
            stroke="var(--ink)"
            strokeWidth="0.8"
            opacity="0.5"
            fill="none"
          />
        </g>
      );
    default: // The galaxy: a spiral of stars around a glowing core
      if (!sky) return null;
      return (
        <g>
          <StarField />
          <g transform="translate(252 66) rotate(-20)">
            <ellipse
              rx="16"
              ry="10"
              fill="var(--maybe)"
              opacity="0.25"
              stroke="none"
            />
            <ellipse
              rx="9"
              ry="6"
              fill="var(--maybe)"
              opacity="0.45"
              stroke="none"
            />
            <circle
              r="3"
              fill="var(--paper)"
              stroke="var(--ink)"
              strokeWidth="1"
            />
            {[0, 180].map((rot) => (
              <g key={rot} transform={`rotate(${rot})`}>
                <path
                  d="M3 0c8-6 20-2 22 8 2 12-12 22-28 18-20-6-24-28-8-40"
                  stroke="var(--ink)"
                  strokeWidth="1.3"
                  fill="none"
                />
                <path
                  d="M3 0c8-6 20-2 22 8 2 12-12 22-28 18-20-6-24-28-8-40"
                  stroke="var(--card)"
                  strokeWidth="6"
                  opacity="0.35"
                  fill="none"
                />
                {[
                  [14, -2],
                  [24, 10],
                  [12, 24],
                  [-8, 24],
                  [-22, 8],
                  [-14, -14],
                  [6, 30],
                ].map(([x, y]) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="1.1"
                    fill="var(--ink)"
                    stroke="none"
                  />
                ))}
              </g>
            ))}
          </g>
        </g>
      );
  }
}

/**
 * Rounds a drawing coordinate. Math.cos/sin can differ in the last digits
 * between the server and the browser, which would break hydration.
 */
export const r2 = (n: number) => Math.round(n * 100) / 100;
