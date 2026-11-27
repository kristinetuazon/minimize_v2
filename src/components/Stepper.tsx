"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useList } from "@/lib/store";

export function Stepper() {
  const pathname = usePathname();
  const { list } = useList();
  const hasItems = list.items.length > 0;
  const hasDecisions = Object.keys(list.decisions).length > 0;
  const ref = useRef<HTMLElement>(null);

  // The current step pops in, and the connectors leading to it draw across.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[aria-current=step]", { scale: 0.6, duration: 0.6, delay: 0.15, ease: "back.out(2.5)" });
      gsap.from("[data-connector=done]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.4,
        delay: 0.1,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
    { scope: ref, dependencies: [pathname] }
  );

  const steps = [
    { n: 1, label: "List", href: "/list", enabled: true },
    { n: 2, label: "Sort", href: "/sort", enabled: hasItems },
    { n: 3, label: "Act", href: "/results", enabled: hasDecisions },
  ];

  return (
    <nav ref={ref} aria-label="Steps" data-reveal>
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
                  className={`${pill} ${step.enabled || current ? "" : "opacity-40"}`}
                  aria-current={current ? "step" : undefined}
                >
                  <span>{step.n}</span> {step.label}
                </span>
              )}
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  data-connector={steps.findIndex((s) => s.href === pathname) > i ? "done" : undefined}
                  className={`h-0.5 w-4 ${steps.findIndex((s) => s.href === pathname) > i ? "bg-ink" : "bg-ink/30"}`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
