"use client";

import { useState } from "react";
import { Intro } from "@/components/Intro";
import { animateOut } from "@/components/motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { PhotoControl } from "@/components/Photo";
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
      <h1 data-reveal className="font-title text-5xl uppercase">What are we sorting?</h1>

      <Intro id="list" summary="Why make a list?">
        <p>
          It could be clothes in the same drawer, a pile of books, or overweight luggage you need
          to trim down. It could also be a bunch of unrelated things you want to scrutinize.
        </p>
        <p>Whatever it is, writing it down one item at a time is the first step.</p>
      </Intro>

      <Card reveal className="flex flex-col gap-5">
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
            Tap 📷 to add a photo.
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
                  onClick={(e) => {
                    if (!prefersReducedMotion())
                      gsap.fromTo(e.currentTarget, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
                    actions.applyTemplate(t.name, t.items);
                  }}
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
                  if (!window.confirm("Remove all items from this list?")) return;
                  const rows = document.querySelectorAll("#item-list > li");
                  if (prefersReducedMotion() || rows.length === 0) return actions.clearItems();
                  gsap.to(rows, {
                    x: 40,
                    autoAlpha: 0,
                    duration: 0.2,
                    stagger: { each: 0.03, from: "end" },
                    ease: "power2.in",
                    onComplete: actions.clearItems,
                  });
                }}
              >
                Clear all
              </button>
            </div>
            <ul id="item-list" className="max-h-72 divide-y divide-ink/20 overflow-y-auto rounded-md border-2 border-ink bg-bg">
              {list.items.map((item) => (
                <li key={item.id} data-reveal className="flex items-center gap-3 overflow-hidden px-3 py-2">
                  <PhotoControl item={item} />
                  <span className="min-w-0 flex-1 break-words">{item.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={(e) => animateOut(e.currentTarget.closest("li"), () => actions.removeItem(item.id))}
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

      <div data-reveal className="flex justify-end">
        <Button href="/sort" disabled={count === 0}>
          Start sorting →
        </Button>
      </div>
    </PageShell>
  );
}
