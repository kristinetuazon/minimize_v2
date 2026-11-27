"use client";

import { useRouter } from "next/navigation";
import { animateOut } from "@/components/motion";
import { Button, Card, PageShell } from "@/components/ui";
import { actions, resumeHref, summarize, useLists } from "@/lib/store";
import { showToast } from "@/lib/toast";
import type { ListState } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export default function ListsPage() {
  const router = useRouter();
  const { lists, currentId, hydrated } = useLists();

  function startNew() {
    actions.newList();
    router.push("/list");
  }

  return (
    <PageShell>
      <div data-reveal className="flex items-end justify-between gap-4">
        <h1 className="font-title text-5xl uppercase">Your lists</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" href="/stats">
            Progress
          </Button>
          <Button onClick={startNew}>+ New</Button>
        </div>
      </div>

      {!hydrated ? null : lists.length === 0 ? (
        <Card reveal className="text-center">
          <p className="mb-4 text-lg">No lists yet.</p>
          <Button onClick={startNew}>Start a list</Button>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
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

function ListRow({ list, current, onOpen }: { list: ListState; current: boolean; onOpen: () => void }) {
  const { undecided, keep, letgo, maybe, handled } = summarize(list);
  const total = list.items.length;
  const status =
    total === 0
      ? "Empty"
      : undecided.length > 0
        ? `${total - undecided.length} of ${total} sorted`
        : maybe.length === 0 && letgo.length > 0 && handled === letgo.length
          ? "Done ✨"
          : [
              keep.length && `${keep.length} kept`,
              letgo.length && `${letgo.length} to let go (${handled} handled)`,
              maybe.length && `${maybe.length} maybe`,
            ]
              .filter(Boolean)
              .join(" · ");
  const name = list.listName || "Untitled list";

  return (
    <li data-reveal>
      <Card className="flex items-center justify-between gap-4 p-5! sm:p-6!">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="flex items-baseline gap-2">
            <span className="truncate font-title text-3xl uppercase">{name}</span>
            {current ? <span className="shrink-0 font-heading text-xs uppercase opacity-70">current</span> : null}
          </span>
          <span className="block text-sm">
            {total} item{total === 1 ? "" : "s"} · {status} · {dateFmt.format(list.updatedAt)}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Delete ${name}`}
          onClick={(e) => {
            animateOut(e.currentTarget.closest("li"), () => showToast(`Deleted “${name}”`, actions.deleteList(list.id)));
          }}
          className="size-10 shrink-0 rounded-full border-2 border-ink/50 hover:bg-sand"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="mx-auto size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </Card>
    </li>
  );
}
