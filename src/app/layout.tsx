import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { HeaderLinks, TabBar } from "@/components/Nav";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/Toaster";
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
        <Script id="theme" src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-dvh">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-5 sm:px-6 print:hidden">
          <Link href="/" className="font-title text-4xl leading-none" aria-label="Minimize home">
            MNMZ
          </Link>
          <div className="flex items-center gap-5">
            <HeaderLinks />
            <ThemeToggle />
          </div>
        </header>
        {/* Room for the phone tab bar. */}
        <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</div>
        <TabBar />
        <Toaster />
        <ServiceWorker />
      </body>
    </html>
  );
}
