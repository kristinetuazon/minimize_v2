"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

const icon = (d: string) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: icon("M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10"),
    match: (p) => p === "/",
  },
  {
    href: "/lists",
    label: "Lists",
    icon: icon("M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"),
    // The List / Sort / Act steps all belong to a list.
    match: (p) =>
      ["/lists", "/list", "/sort", "/results", "/import"].includes(p),
  },
  {
    href: "/stats",
    label: "Journey",
    icon: icon(
      "M12 2.5c4 0 6.5 3 6.5 6.8 0 3.2-2.6 5.7-4.3 7.4h-4.4c-1.7-1.7-4.3-4.2-4.3-7.4C5.5 5.5 8 2.5 12 2.5zM10 16.7l.6 3M14 16.7l-.6 3M10.2 19.7h3.6v2.3h-3.6z",
    ),
    match: (p) => p === "/stats",
  },
];

/** Desktop: text links in the header. */
export function HeaderLinks() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-5 sm:flex">
      {TABS.slice(1).map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.match(path) ? "page" : undefined}
          className="font-heading text-sm uppercase underline-offset-4 hover:underline aria-[current=page]:underline"
        >
          {t.label}
        </Link>
      ))}
      <Link
        href="/about"
        aria-current={path === "/about" ? "page" : undefined}
        className="font-heading text-sm uppercase underline-offset-4 hover:underline aria-[current=page]:underline"
      >
        About
      </Link>
    </nav>
  );
}

/** Phones: an app-style tab bar fixed to the bottom of the screen. */
export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden print:hidden"
    >
      <ul className="grid grid-cols-3">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 font-heading text-[0.7rem] uppercase transition ${
                  active ? "" : "opacity-55"
                }`}
              >
                <span
                  className={`rounded-full px-4 py-0.5 ${active ? "bg-card" : ""}`}
                >
                  {t.icon}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
