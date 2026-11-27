import localFont from "next/font/local";

/*
 * Holipop and Bargemo are licensed for PERSONAL USE ONLY (see their
 * "Read Me !!!.txt" in /Assets). Buy commercial licenses or swap them here
 * before any public or commercial launch. Petrona is OFL and free to use.
 */

export const titleFont = localFont({
  src: "../../Assets/Holipop_Title/Holipop.otf",
  variable: "--font-title-face",
  display: "swap",
});

export const headingFont = localFont({
  src: "../../Assets/Bargemo_Heading/Bargemo-Regular.otf",
  variable: "--font-heading-face",
  display: "swap",
});

export const bodyFont = localFont({
  src: [
    { path: "../../Assets/Petrona_Body/Petrona-VariableFont_wght.ttf", style: "normal" },
    { path: "../../Assets/Petrona_Body/Petrona-Italic-VariableFont_wght.ttf", style: "italic" },
  ],
  variable: "--font-body-face",
  display: "swap",
});
