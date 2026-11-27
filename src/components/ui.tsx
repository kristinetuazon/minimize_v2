import Link from "next/link";
import { Reveal } from "./motion";
import type React from "react";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

const variants = {
  primary: "border-2 border-ink bg-paper shadow-[4px_4px_0_var(--ink)] hover:bg-sand active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--ink)]",
  secondary: "border-2 border-ink/60 hover:bg-sand",
  ghost: "underline underline-offset-4 hover:opacity-70",
};

export function Button({
  children,
  href,
  onClick,
  disabled,
  variant = "primary",
  className = "",
  type = "button",
}: ButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 font-heading text-base uppercase tracking-wide transition ${
    variant === "ghost" ? "min-h-0 px-0 py-1 normal-case" : ""
  } ${variants[variant]} ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/**
 * The signature bordered pink card, with an offset shadow. Use it for the one
 * main thing on a screen; use Panel for everything secondary.
 */
export function Card({
  children,
  className = "",
  reveal = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Animate in when it appears (inside a PageShell / Reveal). */
  reveal?: boolean;
}) {
  return (
    <div
      data-reveal={reveal || undefined}
      className={`border-2 border-ink bg-card p-6 shadow-[5px_5px_0_var(--ink)] sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

/** A quieter container for secondary content. */
export function Panel({
  children,
  className = "",
  reveal = false,
}: {
  children: React.ReactNode;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <div data-reveal={reveal || undefined} className={`border-2 border-ink/25 bg-paper p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

/** Page layout. Direct children with `data-reveal` animate in (see Reveal). */
export function PageShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <Reveal className="contents">
      <main
        className={`mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pt-6 pb-16 sm:px-6 ${wide ? "lg:max-w-[min(100rem,100%)] lg:px-10 xl:px-16" : ""}`}
      >
        {children}
      </main>
    </Reveal>
  );
}

export const inputClasses =
  "w-full rounded-md border-2 border-ink bg-ink px-3 py-2.5 text-bg placeholder:text-bg/60 shadow-sm";
