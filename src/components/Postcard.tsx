import type { Postcard as PostcardData } from "@/lib/types";
import { r2 } from "./art";

const dateFmt = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

/** A finished list as a little art-deco travel poster. */
export function Postcard({ card, index }: { card: PostcardData; index: number }) {
  // Alternate the poster's accent so a wall of them has some rhythm.
  const accent = ["var(--card)", "var(--keep)", "var(--maybe)", "var(--letgo)"][index % 4];
  return (
    <li className="flex flex-col border-2 border-ink bg-paper p-2 shadow-[3px_3px_0_var(--ink)]">
      <svg viewBox="0 0 120 90" className="w-full border border-ink/40" aria-hidden fill="none" stroke="var(--ink)" strokeWidth="1">
        <rect width="120" height="90" fill="var(--sand)" stroke="none" />
        {/* Sunburst */}
        <g opacity="0.35">
          {Array.from({ length: 11 }, (_, i) => {
            const a = (Math.PI * (i + 1)) / 12;
            return <line key={i} x1="60" y1="90" x2={r2(60 - Math.cos(a) * 120)} y2={r2(90 - Math.sin(a) * 120)} />;
          })}
        </g>
        <circle cx="60" cy="90" r="34" fill={accent} opacity="0.55" stroke="none" />
        <path d="M0 82c15-6 30-6 45 0s30 6 45 0 22-5 30-2V90H0z" fill="var(--paper)" />
        {/* Balloon */}
        <path d="M60 14c8 0 13 6 13 13 0 6-5 11-9 15h-8c-4-4-9-9-9-15 0-7 5-13 13-13z" fill="var(--card)" strokeWidth="1.2" />
        <path d="M60 14c-3 4-4 13-3 28M60 14c3 4 4 13 3 28M57 42l1 6M63 42l-1 6" />
        <rect x="57" y="48" width="6" height="4" rx="1" fill="var(--paper)" />
      </svg>
      <p className="mt-2 truncate text-center font-title text-lg uppercase">{card.name}</p>
      <p className="text-center text-xs">
        <span className="text-letgo">{card.letgo} let go</span> · <span className="text-keep">{card.kept} kept</span>
      </p>
      <p className="text-center font-heading text-[0.65rem] uppercase opacity-70">{dateFmt.format(card.date)}</p>
    </li>
  );
}
