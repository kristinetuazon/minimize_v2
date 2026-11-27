"use client";

import { useState } from "react";
import { Intro } from "@/components/Intro";
import { Stepper } from "@/components/Stepper";
import { Button, Card, PageShell, inputClasses } from "@/components/ui";
import { TEMPLATES, splitItems } from "@/lib/content";
import { actions, useList } from "@/lib/store";

export default function ListPage() {
  const { list } = useList();
  const [draft, setDraft] = useState("");
  const count = list.items.length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    actions.addItems(splitItems(draft));
    setDraft("");
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const parts = splitItems(e.clipboardData.getData("text"));
    if (parts.length > 1) {
      e.preventDefault();
      actions.addItems(parts);
    }
  }

  return (
    <PageShell>
      <Stepper />
      <h1 className="font-title text-5xl uppercase">What are we sorting?</h1>

      <Intro id="list" summary="Why make a list?">
        <p>
          It could be clothes in the same drawer, a pile of books, or overweight luggage you need
          to trim down. It could also be a bunch of unrelated things you want to scrutinize.
        </p>
        <p>Whatever it is, writing it down one item at a time is the first step.</p>
      </Intro>

      <Card className="flex flex-col gap-5">
        <div>
          <label htmlFor="list-name" className="mb-2 block font-heading">
            Name of list
          </label>
          <input
            id="list-name"
            className={inputClasses}
            placeholder="e.g. Bedroom closet"
            value={list.listName}
            onChange={(e) => actions.setListName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="list-description" className="mb-2 block font-heading">
            Description <span className="font-body text-sm opacity-70">(optional)</span>
          </label>
          <textarea
            id="list-description"
            rows={2}
            className={inputClasses}
            placeholder="Anything that will help you decide"
            value={list.description}
            onChange={(e) => actions.setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="list-item" className="mb-2 block font-heading">
            Items
          </label>
          <form onSubmit={submit} className="flex gap-2">
            <input
              id="list-item"
              className={inputClasses}
              placeholder="Add an item, or paste a whole list"
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPaste={onPaste}
            />
            <button
              type="submit"
              aria-label="Add item"
              disabled={!draft.trim()}
              className="size-12 shrink-0 rounded-full border-2 border-ink bg-paper text-2xl hover:bg-sand disabled:opacity-40"
            >
              +
            </button>
          </form>
          <p className="mt-2 text-sm opacity-75">
            Press Enter to add. Pasting several lines (or a comma-separated list) adds them all.
          </p>
        </div>

        {count === 0 ? (
          <div>
            <p className="mb-2 font-heading text-sm uppercase">Or start from a template</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => actions.applyTemplate(t.name, t.items)}
                  className="rounded-full border-2 border-ink/60 bg-paper/60 px-3 py-1.5 text-sm hover:bg-sand"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-heading text-sm uppercase">
                {count} item{count === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                className="text-sm underline underline-offset-4"
                onClick={() => {
                  if (window.confirm("Remove all items from this list?")) actions.clearItems();
                }}
              >
                Clear all
              </button>
            </div>
            <ul className="max-h-72 divide-y divide-ink/20 overflow-y-auto rounded-md border-2 border-ink bg-bg">
              {list.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="break-words">{item.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => actions.removeItem(item.id)}
                    className="size-9 shrink-0 rounded-full border-2 border-ink/60 text-xl hover:bg-sand"
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button href="/sort" disabled={count === 0}>
          Start sorting →
        </Button>
      </div>
    </PageShell>
  );
}
