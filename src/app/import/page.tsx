"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button, Card, PageShell } from "@/components/ui";
import { decodeShared } from "@/lib/share";
import { actions } from "@/lib/store";

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export default function ImportPage() {
  const router = useRouter();
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => null);
  const shared = hash ? decodeShared(hash) : null;

  if (hash === null) return <PageShell>{null}</PageShell>;

  if (!shared) {
    return (
      <PageShell>
        <h1 data-reveal className="font-title text-5xl uppercase">Link not found</h1>
        <Card reveal className="text-center">
          <p className="mb-4 text-lg">This share link looks incomplete. Ask for it again, or start your own list.</p>
          <Button href="/">Go home</Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 data-reveal className="font-title text-5xl uppercase">A list for you</h1>
      <Card reveal className="flex flex-col gap-4">
        <h2 className="text-right font-title text-4xl uppercase">{shared.listName || "Shared list"}</h2>
        {shared.description ? <p className="text-center">{shared.description}</p> : null}
        <p className="font-heading text-sm uppercase">
          {shared.items.length} item{shared.items.length === 1 ? "" : "s"}
        </p>
        <ul className="max-h-64 divide-y divide-ink/20 overflow-y-auto rounded-md border-2 border-ink bg-bg">
          {shared.items.map((name, i) => (
            <li key={i} className="px-3 py-2">
              {name}
            </li>
          ))}
        </ul>
      </Card>
      <div data-reveal className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" href="/">
          No thanks
        </Button>
        <Button
          onClick={() => {
            actions.importList(shared);
            router.push("/sort");
          }}
        >
          Add &amp; start sorting →
        </Button>
      </div>
    </PageShell>
  );
}
