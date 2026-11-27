"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

/** Animations only run for people who haven't asked for reduced motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !window.matchMedia(MOTION_OK).matches;

export { gsap, useGSAP, SplitText };
