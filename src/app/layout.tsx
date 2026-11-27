import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/Toaster";
import { THEME_SCRIPT } from "@/lib/theme";
import { bodyFont, headingFont, titleFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "minimize",
  description: "A decluttering list-sorting application.",
  icons: { icon: "/square-svgrepo-com.svg" },
  appleWebApp: { capable: true, title: "Minimize", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1b181c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${titleFont.variable} ${headingFont.variable} ${bodyFont.variable}`}
      // The theme script adds `data-theme` and a `js` class before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved day/night choice and the `js` flag before first paint. */}
        <Script id="theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
      </head>
      <body className="min-h-dvh">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-5 sm:px-6 print:hidden">
          <Link href="/" className="font-title text-4xl leading-none" aria-label="Minimize home">
            MNMZ
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/lists" className="font-heading text-sm uppercase underline-offset-4 hover:underline">
              Your lists
            </Link>
            <ThemeToggle />
          </div>
        </header>
        {children}
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  );
}
