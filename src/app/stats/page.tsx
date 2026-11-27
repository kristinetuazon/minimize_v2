"use client";

import Link from "next/link";
import {
  AltitudeCaption,
  BalloonScene,
  LEVELS,
  useAltitude,
} from "@/components/Balloon";
import { Sparkles } from "@/components/Illustrations";
import { DataPanel } from "@/components/DataPanel";
import { CountUp } from "@/components/motion";
import { Postcard } from "@/components/Postcard";
import { Button, Card, PageShell, Panel } from "@/components/ui";
import { DESTINATIONS } from "@/lib/content";
import { useStats } from "@/lib/store";

export default function StatsPage() {
  const stats = useStats();
  const altitude = useAltitude();
  const maxDest = Math.max(
    1,
    ...Object.values(stats.byDestination).map((n) => n ?? 0),
  );

  return (
    <PageShell>
      <h1 data-reveal className="font-title text-5xl leading-tight">
        Your journey
      </h1>

      {!stats.hydrated ? null : stats.sorted === 0 ? (
        <Card reveal className="text-center">
          <Sparkles />
          <p className="mb-4 text-lg">
            Nothing sorted yet. Your totals will show up here.
          </p>
          <Button href="/list">Start a list</Button>
        </Card>
      ) : (
        <>
          <Card reveal>
            <BalloonScene altitude={altitude} sandbags={altitude.waiting} />
            <AltitudeCaption altitude={altitude} waiting={altitude.waiting} />
            <p className="mt-4 border-t-2 border-ink/20 pt-4 text-center">
              <span className="font-heading text-sm uppercase">
                You&apos;ve let go of
              </span>{" "}
              <span className="font-title text-4xl text-letgo">
                <CountUp value={stats.gone} />
              </span>{" "}
              thing{stats.gone === 1 ? "" : "s"} for good
              {stats.waitingCount > 0
                ? `, with ${stats.waitingCount} more on the way`
                : ""}
              .
            </p>
          </Card>

          <div data-reveal className="grid grid-cols-3 gap-3 text-center">
            <Stat label="sorted" value={stats.sorted} />
            <Stat label="kept" value={stats.kept} tone="text-keep" />
            <Stat
              label={stats.lists === 1 ? "list" : "lists"}
              value={stats.lists}
            />
          </div>

          <section data-reveal>
            <Panel>
              <h2 className="mb-4 font-title text-3xl uppercase">Postcards</h2>
              {stats.postcards.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {stats.postcards.map((card, i) => (
                    <Postcard
                      key={`${card.id}-${card.date}`}
                      card={card}
                      index={i}
                    />
                  ))}
                </ul>
              ) : (
                <p className="opacity-75">
                  Finish sorting a list to collect your first postcard.
                </p>
              )}
            </Panel>
          </section>

          <section data-reveal>
            <Panel>
              <h2 className="mb-4 font-title text-3xl uppercase">The way up</h2>
              <ol className="flex flex-col-reverse gap-1">
                {LEVELS.map((lvl, i) => {
                  const reached = i <= altitude.level;
                  const current = i === altitude.level;
                  return (
                    <li
                      key={lvl.name}
                      aria-current={current ? "step" : undefined}
                      className={`flex items-center justify-between rounded px-3 py-1.5 ${current ? "bg-card" : ""} ${reached ? "" : "opacity-50"}`}
                    >
                      <span>
                        <span aria-hidden className="mr-2 inline-block w-4">
                          {reached ? "✓" : "·"}
                        </span>
                        {lvl.name}
                      </span>
                      <span className="text-xs tabular-nums opacity-70">
                        {reached
                          ? current
                            ? "you are here"
                            : ""
                          : `${lvl.at - altitude.lift} to go`}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-sm opacity-75">
                Lift: +1 per decision, +5 per item you actually let go, +15 per
                finished list. Keeping never weighs you down.
              </p>
            </Panel>
          </section>

          {Object.keys(stats.byDestination).length > 0 ? (
            <section data-reveal>
              <Panel>
                <h2 className="mb-4 font-title text-3xl uppercase">
                  Where it went
                </h2>
                <ul className="flex flex-col gap-3">
                  {DESTINATIONS.filter((d) => stats.byDestination[d.value]).map(
                    (d) => {
                      const n = stats.byDestination[d.value] ?? 0;
                      return (
                        <li key={d.value}>
                          <div className="mb-1 flex justify-between">
                            <span>{d.label}</span>
                            <span className="tabular-nums">{n}</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-ink/15">
                            <div
                              className="h-full bg-letgo"
                              style={{ width: `${(n / maxDest) * 100}%` }}
                            />
                          </div>
                        </li>
                      );
                    },
                  )}
                </ul>
              </Panel>
            </section>
          ) : null}

          <p data-reveal className="text-center text-sm opacity-75">
            {stats.finished} list{stats.finished === 1 ? "" : "s"} fully sorted.
            Totals include lists you&apos;ve deleted.
          </p>
        </>
      )}
      {stats.hydrated ? <DataPanel /> : null}
      <p data-reveal className="text-center text-sm">
        <Link href="/about" className="underline underline-offset-4">
          About Minimize
        </Link>{" "}
        · why it exists and how your data is kept
      </p>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  tone = "",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="border-2 border-ink/25 bg-paper px-2 py-4">
      <p className={`font-title text-4xl leading-none ${tone}`}>
        <CountUp value={value} />
      </p>
      <p className="mt-1 font-heading text-xs uppercase">{label}</p>
    </div>
  );
}
