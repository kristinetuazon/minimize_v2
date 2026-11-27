"use client";

import { useState } from "react";
import { actions } from "@/lib/store";
import type { Item } from "@/lib/types";

/**
 * An item's name that turns into a text field when tapped. Enter or leaving
 * the field saves; Escape cancels; an empty name is ignored.
 */
export function EditableName({ item, className = "" }: { item: Item; className?: string }) {
  const [draft, setDraft] = useState<string | null>(null);

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(item.name)}
        title="Rename"
        aria-label={`Rename ${item.name}`}
        className={`group min-w-0 cursor-text text-left break-words decoration-dotted underline-offset-4 hover:underline ${className}`}
      >
        {item.name}
        <span aria-hidden className="ml-1.5 text-sm opacity-0 transition group-hover:opacity-60 group-focus-visible:opacity-60">
          ✎
        </span>
      </button>
    );
  }

  const save = () => {
    if (draft.trim() && draft.trim() !== item.name) actions.renameItem(item.id, draft);
    setDraft(null);
  };

  return (
    <input
      autoFocus
      aria-label={`New name for ${item.name}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setDraft(null);
      }}
      onFocus={(e) => e.currentTarget.select()}
      className={`min-w-0 flex-1 rounded border-2 border-ink bg-paper px-2 py-0.5 ${className}`}
    />
  );
}
