"use client";

import Link from "next/link";
import { BalloonArt } from "@/components/art";
import { Card, PageShell, Panel } from "@/components/ui";
import { AUTHOR } from "@/lib/content";

export default function AboutPage() {
  return (
    <PageShell>
      <h1 data-reveal className="font-title text-5xl leading-tight">
        About Minimize
      </h1>

      <Card reveal className="flex flex-col items-center gap-6 sm:flex-row">
        <svg viewBox="96 14 128 196" className="h-44 w-auto shrink-0" aria-hidden>
          <BalloonArt bags={2} />
        </svg>
        <div>
          <h2 className="mb-3 font-title text-3xl uppercase">Why Minimize</h2>
          <p className="mb-3 leading-relaxed">
            I wanted to make decluttering <em>fun</em>. Sorting through a drawer, a closet or a whole move usually feels
            like a chore you keep putting off.
          </p>
          <p className="leading-relaxed">
            So Minimize turns it into a game you play one card at a time: keep it, let it go, or decide later. Every
            thing you actually let go of drops a sandbag, and your balloon rises a little higher, from the rooftops all
            the way to the galaxy.
          </p>
        </div>
      </Card>

      <section data-reveal>
        <Panel>
          <h2 className="mb-3 font-title text-3xl uppercase">A small passion project</h2>
          <p className="leading-relaxed">
            Minimize is something I built for the joy of it. There are no ads, no accounts, no subscriptions and no
            tracking. It&apos;s just a calm little tool that&apos;s yours to use however you like, and yours to keep:
            install it on your phone and it works offline too.
          </p>
        </Panel>
      </section>

      <section data-reveal>
        <Panel>
          <h2 className="mb-3 font-title text-3xl uppercase">Your data stays with you</h2>
          <ul className="flex flex-col gap-2 leading-relaxed">
            <li className="flex gap-3">
              <span aria-hidden>🔒</span>
              <span>Your lists, photos and progress are saved only on your device. Nothing is uploaded anywhere.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🗂️</span>
              <span>Minimize asks your browser to protect that storage so it isn&apos;t cleared to free up space.</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>💾</span>
              <span>
                You can download a backup file at any time and restore it on another device, from{" "}
                <Link href="/stats#your-data" className="underline underline-offset-4">
                  Journey → Your data
                </Link>
                .
              </span>
            </li>
          </ul>
        </Panel>
      </section>

      <section data-reveal className="text-center">
        <p className="font-heading text-sm uppercase opacity-70">Made with care by</p>
        <p className="font-title text-4xl">{AUTHOR.name}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={AUTHOR.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-ink bg-paper px-5 py-3 font-heading text-sm uppercase shadow-[4px_4px_0_var(--ink)] hover:bg-sand"
          >
            See my portfolio ↗
          </a>
          <a
            href={AUTHOR.source}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-ink/50 px-5 py-3 font-heading text-sm uppercase hover:bg-sand"
          >
            Source on GitHub ↗
          </a>
        </div>
      </section>
    </PageShell>
  );
}
