"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useList } from "@/lib/store";

export function Stepper() {
  const pathname = usePathname();
  const { list } = useList();
  const hasItems = list.items.length > 0;
  const hasDecisions = Object.keys(list.decisions).length > 0;

  const steps = [
    { n: 1, label: "List", href: "/list", enabled: true },
    { n: 2, label: "Sort", href: "/sort", enabled: hasItems },
    { n: 3, label: "Act", href: "/results", enabled: hasDecisions },
  ];

  return (
    <nav aria-label="Steps">
      <ol className="flex items-center gap-2 font-heading text-sm uppercase">
        {steps.map((step, i) => {
          const current = pathname === step.href;
          const pill = `flex items-center gap-2 rounded-full border-2 px-3 py-1 ${
            current ? "border-ink bg-ink text-bg" : "border-ink/40"
          }`;
          return (
            <li key={step.href} className="flex items-center gap-2">
              {step.enabled && !current ? (
                <Link href={step.href} className={`${pill} hover:border-ink`}>
                  <span>{step.n}</span> {step.label}
                </Link>
              ) : (
                <span
                  className={`${pill} ${step.enabled ? "" : "opacity-40"}`}
                  aria-current={current ? "step" : undefined}
                >
                  <span>{step.n}</span> {step.label}
                </span>
              )}
              {i < steps.length - 1 ? (
                <span aria-hidden className="h-0.5 w-4 bg-ink/30" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
