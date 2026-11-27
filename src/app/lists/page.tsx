"use client";

import { EmptyBox } from "@/components/Illustrations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Fleet } from "@/components/Fleet";
import { animateOut } from "@/components/motion";
import { Button, Card, PageShell, Panel } from "@/components/ui";
import {
  actions,
  isComplete,
  resumeHref,
  summarize,
  useArchived,
  useLists,
  FLEET_MAX,
} from "@/lib/store";
import { showToast } from "@/lib/toast";
import type { ArchivedList, AutoArchive, ListState } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

type TabId = "ongoing" | "completed" | "archived";

export default function ListsPage() {
  const router = useRouter();
  const { lists, currentId, hydrated } = useLists();
  const { archived, autoArchive } = useArchived();
  // Hovering a row or a balloon highlights its partner (and moves the pennant).
  const [hovered, setHovered] = useState<string | null>(null);
  const ongoing = lists.filter((l) => !isComplete(l));
  const completed = lists.filter(isComplete);
  const counts: Record<TabId, number> = {
    ongoing: ongoing.length,
    completed: completed.length,
    archived: archived.length,
  };
  // Opens on the first tab that has something, "In progress" first.
  const [tab, setTab] = useState<TabId | null>(null);
  const firstWithItems =
    (["ongoing", "completed", "archived"] as const).find(
      (t) => counts[t] > 0,
    ) ?? "ongoing";
  const activeTab: TabId = tab && counts[tab] > 0 ? tab : firstWithItems;
  const visible = activeTab === "completed" ? completed : ongoing;
  const open = (list: ListState) => {
    actions.openList(list.id);
    router.push(resumeHref(list));
  };

  function startNew() {
    actions.newList();
    router.push("/list");
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "ongoing", label: "In progress" },
    { id: "completed", label: "Completed" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <PageShell wide>
      <div data-reveal className="flex items-center justify-between gap-4">
        <h1 className="font-title text-4xl leading-tight whitespace-nowrap sm:text-5xl">
          Your lists
        </h1>
        <Button onClick={startNew} className="shrink-0 whitespace-nowrap">
          + New
        </Button>
      </div>

      {!hydrated ? null : lists.length === 0 && archived.length === 0 ? (
        <Card reveal className="text-center">
          <EmptyBox />
          <p className="mb-4 text-lg">No lists yet.</p>
          <Button onClick={startNew}>Start a list</Button>
        </Card>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Lists"
            data-reveal
            className="flex flex-wrap gap-2"
          >
            {tabs.map((t) => {
              const selected = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`lists-tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls="lists-panel"
                  disabled={counts[t.id] === 0}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 border-2 px-4 py-2 font-heading text-sm uppercase transition disabled:opacity-40 ${
                    selected
                      ? "border-ink bg-ink text-bg"
                      : "border-ink/30 hover:border-ink"
                  }`}
                >
                  {t.label}
                  <span className="tabular-nums opacity-70">
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab !== "archived" && visible.length > 0 ? (
            <div data-reveal>
              <Fleet
                lists={visible}
                currentId={currentId}
                highlightId={hovered}
                onHover={setHovered}
                onOpen={open}
              />
              <p className="mt-2 text-center text-sm opacity-70">
                The further along a list is, the higher its balloon flies. Tap
                one to open it.
              </p>
            </div>
          ) : null}

          <div
            role="tabpanel"
            id="lists-panel"
            aria-labelledby={`lists-tab-${activeTab}`}
            data-reveal
            className="flex flex-col gap-4"
          >
            {activeTab === "completed" ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <AutoArchiveSetting value={autoArchive} />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const n = actions.archiveCompleted();
                    if (n) showToast(`Archived ${n} list${n === 1 ? "" : "s"}`);
                  }}
                >
                  Archive all completed
                </Button>
              </div>
            ) : null}

            {activeTab === "archived" ? (
              <>
                <p className="text-sm opacity-75">
                  Archived lists keep their totals and postcards on your
                  Journey. Their photos were cleared to free up space. Restore
                  one to use it again.
                </p>
                <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                  {archived.map((list) => (
                    <ArchivedRow key={list.id} list={list} />
                  ))}
                </ul>
              </>
            ) : (
              <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                {visible.map((list) => (
                  <ListRow
                    key={list.id}
                    list={list}
                    current={list.id === currentId}
                    highlighted={list.id === hovered}
                    onHover={setHovered}
                    onOpen={() => open(list)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}

function AutoArchiveSetting({ value }: { value: AutoArchive }) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-heading uppercase">Auto-archive</span>
      <select
        value={value}
        onChange={(e) => actions.setAutoArchive(e.target.value as AutoArchive)}
        className="rounded-md border-2 border-ink/40 bg-paper px-2 py-1.5"
      >
        <option value="off">Off</option>
        <option value="30d">30 days after finishing</option>
        <option value="full">
          When the sky is full (over {FLEET_MAX} lists)
        </option>
      </select>
    </label>
  );
}

const archivedFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function ArchivedRow({ list }: { list: ArchivedList }) {
  const { keep, letgo } = summarize(list);
  const name = list.listName || "Untitled list";
  return (
    <li data-reveal>
      <Panel className="flex items-center gap-4 p-4! opacity-90 sm:p-5!">
        <div className="min-w-0 flex-1">
          <p className="truncate font-title text-2xl uppercase">{name}</p>
          <p className="text-sm">
            <span className="text-keep">{keep.length} kept</span> ·{" "}
            <span className="text-letgo">{letgo.length} let go</span>
            <span className="opacity-70">
              {" "}
              · archived {archivedFmt.format(list.archivedAt)}
            </span>
          </p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            actions.restoreList(list.id);
            showToast(`Restored “${name}”`);
          }}
        >
          Restore
        </Button>
        <button
          type="button"
          aria-label={`Delete ${name} for good`}
          onClick={(e) =>
            animateOut(e.currentTarget.closest("li"), () =>
              actions.deleteArchived(list.id),
            )
          }
          className="size-10 shrink-0 rounded-full border-2 border-ink/30 hover:bg-sand"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-auto size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </Panel>
    </li>
  );
}

/** "Today", "Yesterday", "3 days ago", or a short date. */
function friendlyDate(ts: number) {
  const day = 86_400_000;
  const startOf = (t: number) => new Date(t).setHours(0, 0, 0, 0);
  const days = Math.round((startOf(Date.now()) - startOf(ts)) / day);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return dateFmt.format(ts);
}

function ListRow({
  list,
  current,
  highlighted,
  onHover,
  onOpen,
}: {
  list: ListState;
  current: boolean;
  highlighted: boolean;
  onHover: (id: string | null) => void;
  onOpen: () => void;
}) {
  const done = isComplete(list);
  const { undecided, keep, letgo, maybe, handled } = summarize(list);
  const total = list.items.length;
  const toGo = letgo.length - handled;
  const status =
    total === 0
      ? "Empty"
      : undecided.length > 0
        ? `Sorting · ${total - undecided.length} of ${total}`
        : maybe.length > 0
          ? `${maybe.length} to decide`
          : toGo > 0
            ? `${toGo} to let go`
            : "All let go";
  const name = list.listName || "Untitled list";
  const segments = [
    { n: keep.length, cls: "bg-keep", label: "kept" },
    { n: handled, cls: "bg-letgo", label: "gone" },
    { n: toGo, cls: "bg-letgo/45", label: "to let go" },
    { n: maybe.length, cls: "bg-maybe", label: "maybe" },
  ].filter((s) => s.n > 0);

  return (
    <li
      data-reveal
      onMouseEnter={() => onHover(list.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(list.id)}
      onBlur={() => onHover(null)}
    >
      <Panel
        className={`relative flex items-center gap-4 p-4! transition sm:p-5! ${
          current ? "border-ink! shadow-[4px_4px_0_var(--card)]" : ""
        } ${highlighted ? "-translate-y-0.5 border-ink!" : ""} ${done ? "bg-sand!" : ""}`}
      >
        {/* Finished lists get a stamp */}
        {done ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 right-16 rotate-[-4deg] rounded border-2 border-keep bg-paper px-2 py-0.5 font-heading text-[0.65rem] text-keep uppercase"
          >
            ✓ Completed
          </span>
        ) : null}
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate font-title text-2xl uppercase">
              {name}
            </span>
            <span className="shrink-0 text-xs opacity-70">
              {friendlyDate(list.updatedAt)}
            </span>
          </span>
          {/* Keep / gone / to let go / maybe, as one stacked bar */}
          <span
            className="mt-2 flex h-2 overflow-hidden rounded-full bg-ink/10"
            role="img"
            aria-label={
              segments.map((s) => `${s.n} ${s.label}`).join(", ") ||
              "nothing sorted yet"
            }
          >
            {segments.map((s) => (
              <span
                key={s.label}
                className={s.cls}
                style={{ width: `${(s.n / Math.max(1, total)) * 100}%` }}
              />
            ))}
          </span>
          <span className="mt-1.5 flex justify-between text-sm">
            <span>
              {done ? <span className="text-keep">Completed ✨</span> : status}
              {current ? (
                <span className="ml-2 font-heading text-xs uppercase opacity-70">
                  · current
                </span>
              ) : null}
            </span>
            <span className="opacity-70">
              {total} item{total === 1 ? "" : "s"}
            </span>
          </span>
        </button>
        {done ? (
          <button
            type="button"
            aria-label={`Archive ${name}`}
            title="Archive"
            onClick={(e) => {
              animateOut(e.currentTarget.closest("li"), () =>
                showToast(`Archived “${name}”`, actions.archiveList(list.id)),
              );
            }}
            className="size-10 shrink-0 rounded-full border-2 border-ink/30 hover:bg-sand"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="mx-auto size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4" />
            </svg>
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Delete ${name}`}
          onClick={(e) => {
            animateOut(e.currentTarget.closest("li"), () =>
              showToast(`Deleted “${name}”`, actions.deleteList(list.id)),
            );
          }}
          className="size-10 shrink-0 rounded-full border-2 border-ink/30 hover:bg-sand"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-auto size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </Panel>
    </li>
  );
}
