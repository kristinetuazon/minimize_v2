import { Josefin_Sans, Poiret_One } from "next/font/google";
import localFont from "next/font/local";

/*
 * All three fonts are free for commercial use under the SIL Open Font License.
 * (They replace Holipop and Bargemo, which were personal-use only.)
 *  - Titles: Poiret One. Thin art-deco geometric capitals.
 *  - Headings: Josefin Sans Light (300). Clean geometric small caps feel.
 *  - Body: Petrona, bundled in /Assets.
 */

export const titleFont = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-title-face",
  display: "swap",
});

export const headingFont = Josefin_Sans({
  subsets: ["latin"],
  weight: "300",
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
