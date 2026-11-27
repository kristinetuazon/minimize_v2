"use client";

import { useRef, useState } from "react";
import { applyBackup, downloadBackup, readBackup } from "@/lib/backup";
import { requestPersistence, usePersistence } from "@/lib/persist";
import { useAppState, useLists } from "@/lib/store";
import { showToast } from "@/lib/toast";
import { Panel } from "./ui";

const DAY = 86_400_000;

export function backupAge(lastBackupAt: number | undefined) {
  if (!lastBackupAt) return null;
  return Math.floor((Date.now() - lastBackupAt) / DAY);
}

/** Says when a backup would be a good idea: never backed up, or not for 30+ days, with lists worth keeping. */
export function useBackupDue() {
  const { lastBackupAt } = useAppState();
  const { lists, hydrated } = useLists();
  const age = backupAge(lastBackupAt);
  return hydrated && lists.length >= 2 && (age === null || age >= 30);
}

const agoText = (days: number | null) =>
  days === null ? "Never backed up" : days === 0 ? "Last backup: today" : days === 1 ? "Last backup: yesterday" : `Last backup: ${days} days ago`;

/** Journey page: is the data protected, when was the last backup, and backup / restore buttons. */
export function DataPanel() {
  const persistence = usePersistence();
  const { lastBackupAt } = useAppState();
  const due = useBackupDue();
  const [busy, setBusy] = useState<"backup" | "restore" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function backup() {
    setBusy("backup");
    try {
      await downloadBackup();
      showToast("Backup downloaded");
    } catch {
      showToast("Couldn't make the backup");
    } finally {
      setBusy(null);
    }
  }

  async function restore(file: File | undefined) {
    if (!file) return;
    setBusy("restore");
    try {
      const { file: backupFile, summary } = await readBackup(file);
      const when = summary.exportedAt ? new Date(summary.exportedAt).toLocaleDateString("en", { dateStyle: "medium" }) : "an unknown date";
      const ok = window.confirm(
        `Replace everything on this device with the backup from ${when}?\n\n` +
          `${summary.lists} list${summary.lists === 1 ? "" : "s"}, ${summary.archived} archived, ${summary.photos} photo${summary.photos === 1 ? "" : "s"}.\n\n` +
          "What's on this device now will be replaced."
      );
      if (!ok) return;
      await applyBackup(backupFile);
      showToast(`Restored ${summary.lists + summary.archived} list${summary.lists + summary.archived === 1 ? "" : "s"}`);
    } catch (e) {
      showToast((e as Error).message || "Couldn't restore that backup");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section data-reveal id="your-data" aria-labelledby="your-data-title">
      <Panel>
        <h2 id="your-data-title" className="mb-4 font-title text-3xl uppercase">
          Your data
        </h2>

        <ul className="mb-4 flex flex-col gap-3 text-sm">
          <li className="flex gap-3">
            <span aria-hidden>{persistence === "persisted" ? "🔒" : "🔓"}</span>
            <span className="flex-1">
              {persistence === "persisted" ? (
                <>
                  <strong>Protected.</strong> Your browser won&apos;t clear Minimize&apos;s data to free up space.
                </>
              ) : persistence === "not-persisted" ? (
                <>
                  <strong>Not protected yet.</strong> If this device runs low on space, the browser may clear your lists.{" "}
                  <button type="button" onClick={() => void requestPersistence(true)} className="underline underline-offset-4">
                    Protect my data
                  </button>
                </>
              ) : persistence === "unsupported" ? (
                <>This browser decides on its own whether to keep data, so a backup now and then is a good idea.</>
              ) : (
                <>Checking storage…</>
              )}
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden>💾</span>
            <span className={`flex-1 ${due ? "text-letgo" : ""}`}>
              {agoText(backupAge(lastBackupAt))}
              {due ? ". Worth making one." : "."}
            </span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void backup()}
            disabled={busy !== null}
            className="border-2 border-ink bg-paper px-4 py-2 font-heading text-sm uppercase shadow-[3px_3px_0_var(--ink)] hover:bg-sand disabled:opacity-50"
          >
            {busy === "backup" ? "Preparing…" : "⬇ Download backup"}
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy !== null}
            className="border-2 border-ink/50 px-4 py-2 font-heading text-sm uppercase hover:bg-sand disabled:opacity-50"
          >
            {busy === "restore" ? "Restoring…" : "Restore from backup"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            aria-label="Backup file"
            className="sr-only"
            onChange={(e) => {
              void restore(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-3 text-sm opacity-75">
          A backup is one file with all your lists, postcards, settings and photos. It stays with you: use it to move to
          a new phone or to recover after clearing your browser.
        </p>
      </Panel>
    </section>
  );
}
