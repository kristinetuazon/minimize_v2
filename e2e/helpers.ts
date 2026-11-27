import type { Page } from "@playwright/test";

/** On phones the Act page shows one group at a time; open that tab if it's there. */
export async function showTab(page: Page, name: "Let go" | "Keep" | "Maybe") {
  // Tabs only exist below the desktop breakpoint (Tailwind lg = 1024px).
  if ((page.viewportSize()?.width ?? 0) >= 1024) return;
  await page.getByRole("tab", { name: new RegExp(`^${name}`) }).click();
}

/** The main "Lists" link: header link on desktop, tab bar on phones. */
export const listsLink = (page: Page) =>
  page.getByRole("link", { name: "Lists", exact: true }).filter({ visible: true });
