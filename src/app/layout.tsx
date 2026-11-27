import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { bodyFont, headingFont, titleFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "minimize",
  description: "A decluttering list-sorting application.",
  icons: { icon: "/square-svgrepo-com.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1a1b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${titleFont.variable} ${headingFont.variable} ${bodyFont.variable}`}
    >
      <body className="min-h-dvh">
        <header className="mx-auto flex w-full max-w-5xl items-center px-4 pt-5 sm:px-6">
          <Link href="/" className="font-title text-4xl leading-none" aria-label="Minimize home">
            MNMZ
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
