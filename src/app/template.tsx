"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

// Where each page sits in the flow, so moving forward slides in from the
// right and going back slides in from the left.
const ORDER: Record<string, number> = {
  "/": 0,
  "/lists": 1,
  "/import": 1,
  "/list": 2,
  "/sort": 3,
  "/results": 4,
  "/stats": 5,
};
let lastIndex: number | null = null;

/** Remounts on every navigation (that's what a Next.js template does). */
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const index = ORDER[path] ?? 0;
      const from = lastIndex;
      lastIndex = index;
      // No slide on the first page load, or when motion is unwelcome.
      if (from === null || from === index || prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { x: index > from ? 36 : -36, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power3.out", clearProps: "transform,opacity" }
      );
    },
    { dependencies: [path] }
  );

  return <div ref={ref}>{children}</div>;
}
