import { DESTINATIONS } from "./content";
import { summarize } from "./store";
import type { ListState, SharedList } from "./types";

/* ---------- invite links ---------- */

// The list travels in the URL fragment (#…), which browsers never send to the
// server, so a shared list stays between the two people.

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string) {
  const bin = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function shareLink(list: ListState, origin: string) {
  const payload = { n: list.listName, d: list.description, i: list.items.map((i) => i.name) };
  return `${origin}/import#${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeShared(hash: string): SharedList | null {
  try {
    const data = JSON.parse(fromBase64Url(hash.replace(/^#/, ""))) as { n?: unknown; d?: unknown; i?: unknown };
    if (!Array.isArray(data.i)) return null;
    const items = data.i.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, 500);
    if (items.length === 0) return null;
    return {
      listName: typeof data.n === "string" ? data.n.slice(0, 200) : "",
      description: typeof data.d === "string" ? data.d.slice(0, 2000) : "",
      items: items.map((s) => s.slice(0, 200)),
    };
  } catch {
    return null;
  }
}

/* ---------- exports ---------- */

const planLabel = (list: ListState, id: string) => {
  const d = list.outcomes[id]?.destination;
  return d ? DESTINATIONS.find((x) => x.value === d)?.label.replace(/^\S+\s/, "") ?? "" : "";
};

/** A plain-text summary that reads well in a message or a notes app. */
export function resultsText(list: ListState) {
  const { keep, letgo, maybe, undecided } = summarize(list);
  const lines: string[] = [`${list.listName || "My list"} · sorted with Minimize`, ""];
  const section = (title: string, rows: string[]) => {
    if (rows.length === 0) return;
    lines.push(`${title} (${rows.length})`, ...rows.map((r) => `• ${r}`), "");
  };
  section("Keep", keep.map((i) => i.name));
  section(
    "Let go",
    letgo.map((i) => {
      const plan = planLabel(list, i.id);
      const done = list.outcomes[i.id]?.done ? " ✓" : "";
      return `${i.name}${plan ? ` → ${plan}` : ""}${done}`;
    })
  );
  section("Maybe", maybe.map((i) => i.name));
  section("Not sorted yet", undecided.map((i) => i.name));
  return lines.join("\n").trim();
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function resultsCsv(list: ListState) {
  const label = { keep: "Keep", letgo: "Let go", maybe: "Maybe" } as const;
  const rows = [["Item", "Decision", "Plan", "Done"]];
  for (const item of list.items) {
    const choice = list.decisions[item.id];
    rows.push([
      item.name,
      choice ? label[choice] : "",
      choice === "letgo" ? planLabel(list, item.id) : "",
      choice === "letgo" && list.outcomes[item.id]?.done ? "Yes" : "",
    ]);
  }
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadFile(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fileSlug = (name: string) =>
  (name || "minimize-list").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "minimize-list";
