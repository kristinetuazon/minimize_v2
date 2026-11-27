"use client";

import { useEffect, useState } from "react";
import { downloadFile, fileSlug, resultsCsv, resultsText, shareLink } from "@/lib/share";
import type { ListState } from "@/lib/types";
import { Card } from "./ui";

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareExport({ list }: { list: ListState }) {
  const [toast, setToast] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  // Feature-detect after mount so server and client markup match.
  useEffect(() => {
    const id = requestAnimationFrame(() => setCanShare(typeof navigator.share === "function"));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const title = list.listName || "My list";

  async function shareResults() {
    const text = resultsText(list);
    if (canShare) {
      try {
        await navigator.share({ title: `${title} · Minimize`, text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    setToast((await copy(text)) ? "Results copied" : "Couldn't copy");
  }

  async function shareInvite() {
    const url = shareLink(list, window.location.origin);
    if (canShare) {
      try {
        await navigator.share({ title: `Sort “${title}” with Minimize`, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    setToast((await copy(url)) ? "Invite link copied" : "Couldn't copy");
  }

  const btn =
    "flex min-h-11 items-center justify-center gap-2 border-2 border-ink/60 bg-paper px-3 py-2 text-sm hover:bg-sand";

  return (
    <section data-reveal className="print:hidden">
      <Card>
        <h2 className="mb-4 font-title text-4xl uppercase">Share & export</h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={btn} onClick={shareResults}>
            {canShare ? "📤 Share results" : "📋 Copy results"}
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => downloadFile(`${fileSlug(list.listName)}.csv`, resultsCsv(list), "text/csv")}
          >
            ⬇ Download CSV
          </button>
          <button type="button" className={btn} onClick={() => window.print()}>
            🖨 Print
          </button>
          <button type="button" className={btn} onClick={shareInvite}>
            🔗 Invite to sort
          </button>
        </div>
        <p className="mt-3 text-sm opacity-75">
          “Invite to sort” sends the list (no photos or decisions) so someone else can sort it themselves.
        </p>
        <p role="status" aria-live="polite" className="mt-2 h-5 text-center font-heading text-sm uppercase">
          {toast}
        </p>
      </Card>
    </section>
  );
}
