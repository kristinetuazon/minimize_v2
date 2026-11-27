"use client";

import { useId, useState } from "react";
import { deletePhotos, savePhoto, usePhotoUrl } from "@/lib/photos";
import { actions } from "@/lib/store";
import type { Item } from "@/lib/types";

/** A square thumbnail of an item's photo, or nothing if it has none. */
export function Thumb({ item, className = "size-10" }: { item: Item; className?: string }) {
  const url = usePhotoUrl(item.id, item.photo);
  if (!item.photo) return null;
  return url ? (
    // Blob URLs can't go through next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={`${className} shrink-0 rounded-md border-2 border-ink object-cover`} />
  ) : (
    <span className={`${className} shrink-0 animate-pulse rounded-md border-2 border-ink/40 bg-ink/10`} />
  );
}

/** Add / replace / remove the photo for an item on the current list. */
export function PhotoControl({ item }: { item: Item }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      await savePhoto(item.id, file);
      actions.setItemPhoto(item.id, true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="relative flex shrink-0 items-center">
      <input
        id={inputId}
        type="file"
        // No `capture`: phones then offer both the camera and the photo library.
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={inputId}
        title={item.photo ? "Replace photo" : "Add photo"}
        aria-label={`${item.photo ? "Replace" : "Add"} photo for ${item.name}`}
        className={`flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 ${
          error ? "border-letgo" : "border-ink/50"
        } ${busy ? "animate-pulse" : ""} hover:bg-sand`}
      >
        {item.photo ? <Thumb item={item} className="size-full border-0 rounded-none" /> : <span aria-hidden>📷</span>}
      </label>
      {item.photo ? (
        <button
          type="button"
          aria-label={`Remove photo for ${item.name}`}
          onClick={() => {
            void deletePhotos([item.id]);
            actions.setItemPhoto(item.id, false);
          }}
          className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border border-ink bg-paper text-xs leading-none"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
