"use client";

import { Confetti, CountUp } from "@/components/motion";
import { Button, Card, PageShell } from "@/components/ui";
import { DESTINATIONS } from "@/lib/content";
import { useStats } from "@/lib/store";

export default function StatsPage() {
  const stats = useStats();
  const maxDest = Math.max(1, ...Object.values(stats.byDestination).map((n) => n ?? 0));

  return (
    <PageShell>
      <h1 data-reveal className="font-title text-5xl uppercase">
        Your progress
      </h1>

      {!stats.hydrated ? null : stats.sorted === 0 ? (
        <Card reveal className="text-center">
          <p className="mb-4 text-lg">Nothing sorted yet. Your totals will show up here.</p>
          <Button href="/list">Start a list</Button>
        </Card>
      ) : (
        <>
          <Card reveal className="relative text-center">
            {stats.gone > 0 ? <Confetti pieces={40} /> : null}
            <p className="font-heading text-sm uppercase">You&apos;ve let go of</p>
            <p className="font-title text-8xl leading-none text-letgo">
              <CountUp value={stats.gone} />
            </p>
            <p className="mt-2 text-lg">
              thing{stats.gone === 1 ? "" : "s"} for good
              {stats.waitingCount > 0 ? `, with ${stats.waitingCount} more on the way` : ""}.
            </p>
          </Card>

          <div data-reveal className="grid grid-cols-3 gap-3 text-center">
            <Stat label="sorted" value={stats.sorted} />
            <Stat label="kept" value={stats.kept} tone="text-keep" />
            <Stat label={stats.lists === 1 ? "list" : "lists"} value={stats.lists} />
          </div>

          {Object.keys(stats.byDestination).length > 0 ? (
            <section data-reveal>
              <Card>
                <h2 className="mb-4 font-title text-4xl uppercase">Where it went</h2>
                <ul className="flex flex-col gap-3">
                  {DESTINATIONS.filter((d) => stats.byDestination[d.value]).map((d) => {
                    const n = stats.byDestination[d.value] ?? 0;
                    return (
                      <li key={d.value}>
                        <div className="mb-1 flex justify-between">
                          <span>{d.label}</span>
                          <span className="tabular-nums">{n}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-ink/15">
                          <div className="h-full bg-letgo" style={{ width: `${(n / maxDest) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          ) : null}

          <p data-reveal className="text-center text-sm opacity-75">
            {stats.finished} list{stats.finished === 1 ? "" : "s"} fully sorted. Totals include lists you&apos;ve deleted.
          </p>
        </>
      )}
    </PageShell>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="border-2 border-ink bg-paper px-2 py-4">
      <p className={`font-title text-4xl leading-none ${tone}`}>
        <CountUp value={value} />
      </p>
      <p className="mt-1 font-heading text-xs uppercase">{label}</p>
    </div>
  );
}
