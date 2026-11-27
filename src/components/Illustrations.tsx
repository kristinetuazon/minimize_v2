/*
 * Small line drawings for empty states, in the same thin, geometric spirit as
 * the fonts. They use currentColor, so they follow day and night mode.
 */

const base = {
  viewBox: "0 0 160 120",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "mx-auto mb-4 h-28 w-auto",
};

/** An open, empty box with a few dust motes. */
export function EmptyBox() {
  return (
    <svg {...base}>
      <path d="M40 54l40-16 40 16-40 16z" />
      <path d="M40 54v38l40 16 40-16V54" />
      <path d="M80 70v38" />
      <path d="M40 54l-14-14 40-14 14 12M120 54l14-14-40-14-14 12" />
      <circle cx="58" cy="18" r="1.5" />
      <circle cx="100" cy="12" r="1" />
      <circle cx="112" cy="26" r="1.5" />
    </svg>
  );
}

/** A fanned stack of blank cards. */
export function CardStack() {
  return (
    <svg {...base}>
      <rect x="46" y="22" width="56" height="76" rx="2" transform="rotate(-12 74 60)" opacity="0.45" />
      <rect x="56" y="20" width="56" height="76" rx="2" transform="rotate(8 84 58)" opacity="0.7" />
      <rect x="52" y="24" width="56" height="76" rx="2" />
      <path d="M62 44h36M62 54h24" />
    </svg>
  );
}

/** A little sparkle burst over an empty shelf. */
export function Sparkles() {
  return (
    <svg {...base}>
      <path d="M24 96h112M36 96v10M124 96v10" />
      <path d="M80 30v24M68 42h24M71 33l18 18M89 33L71 51" />
      <path d="M44 62v10M39 67h10M116 56v12M110 62h12" />
      <circle cx="58" cy="30" r="1.5" />
      <circle cx="104" cy="28" r="1.5" />
    </svg>
  );
}
