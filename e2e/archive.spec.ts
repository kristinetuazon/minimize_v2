import { expect, test, type Page } from "@playwright/test";
import { showTab } from "./helpers";

/** Makes a list, sorts it (keep, let go) and ticks the let-go item off, so it's complete. */
async function finishList(page: Page, name: string) {
  await page.goto("/list");
  await page.getByLabel("Name of list").fill(name);
  for (const item of ["Lamp", "Vase"]) {
    await page.getByLabel("Items", { exact: true }).fill(item);
    await page.getByLabel("Items", { exact: true }).press("Enter");
  }
  await page.getByRole("link", { name: /start sorting/i }).click();
  await page.getByRole("button", { name: /^\W*keep$/i }).click();
  await expect(page.getByText("2 of 2")).toBeVisible();
  await page.getByRole("button", { name: /^\W*let go$/i }).click();
  await expect(page.getByRole("heading", { name: /all sorted/i })).toBeVisible();
  await page.getByRole("link", { name: /see results/i }).click();
  await showTab(page, "Let go");
  await page.getByRole("checkbox", { name: "Mark Vase as gone" }).check();
}

test("archive a completed list, undo, restore, and keep its postcard", async ({ page }) => {
  await finishList(page, "Hall table");
  await page.goto("/lists");
  await expect(page.getByRole("tab", { name: /completed/i })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Archive Hall table" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Archived “Hall table”" })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: "Archive Hall table" })).toBeVisible();

  await page.getByRole("button", { name: "Archive Hall table" }).click();
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByRole("tab", { name: /archived/i })).toContainText("1");
  await page.getByRole("tab", { name: /archived/i }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Hall table");

  // Still on the Journey page.
  await page.goto("/stats");
  const postcards = page.locator("section", { has: page.getByRole("heading", { name: "Postcards" }) });
  await expect(postcards).toContainText("Hall table");

  await page.goto("/lists");
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByRole("tab", { name: /completed/i })).toContainText("1");
});

test("auto-archive: 30 days after finishing", async ({ page }) => {
  await finishList(page, "Garden shed");
  await page.goto("/lists");
  await page.getByLabel("Auto-archive").selectOption("30d");
  await expect(page.getByRole("tab", { name: /archived/i })).toContainText("0");

  await page.clock.setFixedTime(new Date(Date.now() + 31 * 86_400_000));
  await page.reload();
  await expect(page.getByRole("tab", { name: /archived/i })).toContainText("1");
});

test("a storage-full warning offers to archive finished lists", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if ((window as unknown as { __full?: boolean }).__full && key === "minimize:list") {
        throw new DOMException("full", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };
  });
  await page.goto("/list");
  await page.evaluate(() => ((window as unknown as { __full: boolean }).__full = true));
  await page.getByLabel("Name of list").fill("Too much");
  await expect(page.getByRole("alert").filter({ hasText: "Storage is full" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive finished lists" })).toBeVisible();
});
