/*
 * "Let go to rise": the balloon's altitude comes from lifetime progress.
 * Letting things go (actually ticking them off) lifts the most; sorting
 * decisions give a little lift; finishing a list catches an updraft.
 * Keeping things never weighs you down, and nothing is ever lost.
 */

export const LIFT = { decision: 1, gone: 5, finished: 15 } as const;

export const LEVELS = [
  { name: "Rooftops", at: 0 },
  { name: "Treetops", at: 15 },
  { name: "Low clouds", at: 60 },
  { name: "High clouds", at: 150 },
  { name: "Mountain peaks", at: 300 },
  { name: "The aurora", at: 550 },
  { name: "The stars", at: 900 },
  { name: "The moon", at: 1400 },
  { name: "The galaxy", at: 2200 },
] as const;

export type Altitude = {
  lift: number;
  level: number;
  name: string;
  next: (typeof LEVELS)[number] | null;
  /** 0..1 progress from this level to the next (1 at the top). */
  progress: number;
  toNext: number;
};

export function altitudeFor(stats: { sorted: number; gone: number; finished: number }): Altitude {
  const lift = stats.sorted * LIFT.decision + stats.gone * LIFT.gone + stats.finished * LIFT.finished;
  let level = 0;
  for (let i = 0; i < LEVELS.length; i++) if (lift >= LEVELS[i]!.at) level = i;
  const here = LEVELS[level]!;
  const next = LEVELS[level + 1] ?? null;
  const progress = next ? (lift - here.at) / (next.at - here.at) : 1;
  return { lift, level, name: here.name, next, progress, toNext: next ? next.at - lift : 0 };
}
