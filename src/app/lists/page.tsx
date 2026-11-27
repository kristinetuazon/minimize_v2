"use client";

import { EmptyBox } from "@/components/Illustrations";
import { useRouter } from "next/navigation";
import { animateOut } from "@/components/motion";
import { Button, Card, PageShell, Panel } from "@/components/ui";
import { actions, resumeHref, summarize, useLists } from "@/lib/store";
import { showToast } from "@/lib/toast";
import type { ListState } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

export default function ListsPage() {
  const router = useRouter();
  const { lists, currentId, hydrated } = useLists();

  function startNew() {
    actions.newList();
    router.push("/list");
  }

  return (
    <PageShell wide>
      <div data-reveal className="flex items-center justify-between gap-4">
        <h1 className="font-title text-4xl leading-tight whitespace-nowrap sm:text-5xl">Your lists</h1>
        <Button onClick={startNew} className="shrink-0 whitespace-nowrap">
          + New
        </Button>
      </div>

      {!hydrated ? null : lists.length === 0 ? (
        <Card reveal className="text-center">
          <EmptyBox />
          <p className="mb-4 text-lg">No lists yet.</p>
          <Button onClick={startNew}>Start a list</Button>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
          {lists.map((list) => (
            <ListRow
              key={list.id}
              list={list}
              current={list.id === currentId}
              onOpen={() => {
                actions.openList(list.id);
                router.push(resumeHref(list));
              }}
            />
          ))}
        </ul>
      )}
    </PageShell>
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
  onOpen,
}: {
  list: ListState;
  current: boolean;
  onOpen: () => void;
}) {
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
            : "Done ✨";
  const name = list.listName || "Untitled list";
  const segments = [
    { n: keep.length, cls: "bg-keep", label: "kept" },
    { n: handled, cls: "bg-letgo", label: "gone" },
    { n: toGo, cls: "bg-letgo/45", label: "to let go" },
    { n: maybe.length, cls: "bg-maybe", label: "maybe" },
  ].filter((s) => s.n > 0);

  return (
    <li data-reveal>
      <Panel
        className={`flex items-center gap-4 p-4! sm:p-5! ${current ? "border-ink! shadow-[4px_4px_0_var(--card)]" : ""}`}
      >
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
              {status}
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
