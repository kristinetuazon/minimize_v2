"use client";

import { useEffect, useState } from "react";
import { actions, reportStorageFull, useAppState, useHydrated, useStorageFull } from "@/lib/store";
import { showToast } from "@/lib/toast";

/**
 * Background tidying: applies the auto-archive setting whenever lists change,
 * and warns (with a one-tap fix) if the device's storage fills up.
 */
export function Housekeeping() {
  const { lists, autoArchive } = useAppState();
  const hydrated = useHydrated();
  const full = useStorageFull();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hydrated && autoArchive && autoArchive !== "off") actions.runAutoArchive();
  }, [hydrated, lists, autoArchive]);

  if (!full || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] print:hidden"
    >
      <div className="flex max-w-xl flex-wrap items-center gap-3 border-2 border-letgo bg-paper px-4 py-3 shadow-[4px_4px_0_var(--letgo)]">
        <p className="min-w-0 flex-1 text-sm">
          <strong className="font-heading uppercase">Storage is full.</strong> Recent changes may not be saved on this
          device. Archiving finished lists clears their photos and frees up space.
        </p>
        <button
          type="button"
          onClick={() => {
            const n = actions.archiveCompleted();
            showToast(n ? `Archived ${n} finished list${n === 1 ? "" : "s"}` : "No finished lists to archive yet");
            // Try saving again now that there may be room.
            reportStorageFull(false);
          }}
          className="border-2 border-ink bg-paper px-3 py-1.5 font-heading text-xs uppercase hover:bg-sand"
        >
          Archive finished lists
        </button>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="px-2 text-lg leading-none opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
