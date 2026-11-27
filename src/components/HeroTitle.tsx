"use client";

import { useRef } from "react";
import { SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * MINIMIZE starts as a scattered pile of letters and tidies itself into a
 * line (clutter → order). Then the rest of the hero (sibling `[data-reveal]`
 * elements) follows. Hovering a letter gives it a little hop.
 */
export function HeroTitle() {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const title = ref.current;
      if (!title) return;
      // Not filtered by [data-revealed]: in dev, Strict Mode runs this twice and
      // the second run must still own these elements.
      // Siblings come from the title's own parent: a parent's ref isn't attached
      // yet when this child effect runs.
      const rest = gsap.utils
        .toArray<HTMLElement>("[data-reveal]", title.parentElement)
        .filter((el) => el !== title);
      [title, ...rest].forEach((el) => el.setAttribute("data-revealed", ""));

      if (prefersReducedMotion()) {
        gsap.set([title, ...rest], { autoAlpha: 1 });
        return;
      }
      // Keep everything hidden while we wait for the font (marking them
      // revealed above lifts the CSS that was hiding them).
      gsap.set([title, ...rest], { autoAlpha: 0 });

      // Split once the display font has loaded so letters are measured correctly.
      void document.fonts.ready.then(
        contextSafe!(() => {
          const split = SplitText.create(title, { type: "chars", charsClass: "inline-block" });
          const w = window.innerWidth;
          const h = window.innerHeight;

          // 1. letters pop up as a messy pile, 2. a beat, 3. they tidy into a line.
          gsap.set(split.chars, {
            x: () => gsap.utils.random(-w * 0.35, w * 0.35),
            y: () => gsap.utils.random(-h * 0.25, h * 0.3),
            rotation: () => gsap.utils.random(-120, 120),
            scale: () => gsap.utils.random(0.5, 1.4),
          });
          gsap
            .timeline()
            .set(title, { autoAlpha: 1 })
            .from(split.chars, {
              autoAlpha: 0,
              scale: 0,
              duration: 0.35,
              ease: "back.out(2)",
              stagger: { each: 0.03, from: "random" },
            })
            .to(
              split.chars,
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 1.1,
                ease: "expo.inOut",
                stagger: { each: 0.04, from: "random" },
              },
              "+=0.25"
            )
            .fromTo(
              rest,
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1, clearProps: "transform" },
              "-=0.35"
            );

          split.chars.forEach((char) => {
            char.addEventListener(
              "mouseenter",
              contextSafe!(() => {
                if (gsap.isTweening(char)) return;
                gsap
                  .timeline()
                  .to(char, { y: "-0.18em", rotation: gsap.utils.random(-12, 12), duration: 0.18, ease: "power2.out" })
                  .to(char, { y: 0, rotation: 0, duration: 0.5, ease: "bounce.out" });
              })
            );
          });
        })
      );
    },
    { scope: ref }
  );

  return (
    <h1
      ref={ref}
      data-reveal
      aria-label="Minimize"
      className="font-title text-[clamp(4rem,18vw,9rem)] leading-none select-none"
    >
      MINIMIZE
    </h1>
  );
}
