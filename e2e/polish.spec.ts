import { showTab } from "./helpers";
import { expect, test, type Page } from "@playwright/test";

async function makeList(page: Page, name: string, items: string[]) {
  await page.goto("/list");
  await page.getByLabel("Name of list").fill(name);
  for (const item of items) {
    await page.getByLabel("Items", { exact: true }).fill(item);
    await page.getByLabel("Items", { exact: true }).press("Enter");
  }
}

/** Sorts the remaining cards with the buttons, waiting for each to land. */
async function sortAll(page: Page, choices: ("keep" | "let go")[]) {
  for (const choice of choices) {
    const before = await page.locator('[role="group"][aria-roledescription="card"]').count();
    await page.getByRole("button", { name: new RegExp(`^\\W*${choice}$`, "i") }).click();
    await expect(page.locator('[role="group"][aria-roledescription="card"]')).not.toHaveCount(before, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(350);
  }
}

test("rename items on the list page and the Act page", async ({ page }) => {
  await makeList(page, "Desk", ["Stapelr"]);
  await page.getByRole("button", { name: "Rename Stapelr" }).click();
  await page.getByLabel("New name for Stapelr").fill("Stapler");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Rename Stapler" })).toBeVisible();

  await page.getByRole("link", { name: /start sorting/i }).click();
  await sortAll(page, ["let go"]);
  await page.getByRole("link", { name: /see results/i }).click();
  await page.getByRole("button", { name: "Rename Stapler" }).click();
  await page.getByLabel("New name for Stapler").fill("Red stapler");
  await page.getByLabel("New name for Stapler").blur();
  await expect(page.getByRole("button", { name: "Rename Red stapler" })).toBeVisible();

  // Escape cancels.
  await page.getByRole("button", { name: "Rename Red stapler" }).click();
  await page.getByLabel("New name for Red stapler").fill("Nope");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Rename Red stapler" })).toBeVisible();
});

test("removing an item or a list can be undone from the toast", async ({ page }) => {
  await makeList(page, "Shelf", ["Vase", "Clock"]);
  await page.getByRole("button", { name: "Remove Vase" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Removed “Vase”" })).toBeVisible();
  await expect(page.getByText("1 item", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("2 items", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename Vase" })).toBeVisible();

  await page.goto("/lists");
  await page.getByRole("button", { name: "Delete Shelf" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Deleted “Shelf”" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^shelf/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: /^shelf/i })).toBeVisible();
});

test("a swipe still in flight is saved when you jump to results", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "reduced-motion", "No fly-out animation to interrupt with reduced motion");
  // Three items, so the "See results so far" link is still there after Scarf lands.
  await makeList(page, "Bag", ["Hat", "Scarf", "Gloves"]);
  await page.getByRole("link", { name: /start sorting/i }).click();
  await sortAll(page, ["keep"]);
  // Let go of Scarf and immediately leave, before the card finishes flying.
  await page.getByRole("button", { name: /let go/i }).click();
  await page.getByRole("link", { name: /see results so far/i }).click();
  await expect(page).toHaveURL(/\/results$/);
  const letGo = page.locator("section", { has: page.getByRole("heading", { name: /^let go/i }) });
  await expect(letGo.getByText("Scarf")).toBeVisible();
});

test("keep-only-N: narrow down until under the limit", async ({ page }) => {
  await makeList(page, "Carry-on", ["Boots", "Jacket", "Camera"]);
  await page.getByLabel("Keep at most").fill("1");
  await page.getByRole("link", { name: /start sorting/i }).click();
  await expect(page.getByText("Keeping 0 of 1 max")).toBeVisible();
  await sortAll(page, ["keep", "keep", "keep"]);

  await expect(page.getByRole("heading", { name: /over your limit/i })).toBeVisible();
  await page.getByRole("button", { name: "Narrow down" }).click();
  await expect(page.getByText(/let go of 2 more/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /maybe/i })).toBeDisabled();
  await sortAll(page, ["keep", "let go", "let go"]);
  await expect(page.getByRole("heading", { name: /all sorted/i })).toBeVisible();

  await page.getByRole("link", { name: /see results/i }).click();
  await showTab(page, "Keep");
  const keep = page.locator("section", { has: page.getByRole("heading", { name: /^keep/i }) });
  await expect(keep.getByText("Boots")).toBeVisible();
  await expect(page.getByText(/over your limit/i)).toHaveCount(0);
});

test("packing checklist on the Keep list", async ({ page }) => {
  await makeList(page, "Trip", ["Passport", "Charger"]);
  await page.getByRole("link", { name: /start sorting/i }).click();
  await sortAll(page, ["keep", "keep"]);
  await page.getByRole("link", { name: /see results/i }).click();

  await page.getByRole("switch").check();
  await page.getByRole("checkbox", { name: "Mark Passport as packed" }).check();
  await page.getByRole("checkbox", { name: "Mark Charger as packed" }).check();
  await expect(page.getByText("All packed.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Mark Passport as packed" })).toBeChecked();
});

test("reminders on home, and lifetime stats that survive deleting a list", async ({ page }) => {
  await makeList(page, "Garage", ["Old bike", "Paint cans", "Ladder"]);
  await page.getByRole("link", { name: /start sorting/i }).click();
  await sortAll(page, ["let go", "let go", "keep"]);
  await page.getByRole("link", { name: /see results/i }).click();
  await page.getByLabel("Plan for Old bike").selectOption("sell");
  await page.getByLabel("Plan for Paint cans").selectOption("recycle");
  await page.getByRole("checkbox", { name: "Mark Paint cans as gone" }).check();

  await page.goto("/");
  // Home shows one next step for the current list.
  const next = page.getByRole("region", { name: "Next step" });
  await expect(next).toContainText("Let go of 1 thing");
  await expect(next).toContainText("1 to sell");
  await next.getByRole("link", { name: /let go/i }).click();
  await expect(page).toHaveURL(/\/results$/);

  // Start another list: home now points at it, and Garage shows as "also waiting".
  await page.goto("/");
  await next.getByRole("button", { name: "New list" }).click();
  await page.getByLabel("Items", { exact: true }).fill("Rake");
  await page.getByLabel("Items", { exact: true }).press("Enter");
  await page.goto("/");
  await expect(next).toContainText("Keep sorting");
  await expect(next).toContainText("0 of 1 sorted");
  await next.getByRole("button", { name: /garage · 1/i }).click();
  await expect(page).toHaveURL(/\/results$/);

  await page.goto("/stats");
  await expect(page.getByText("You've let go of")).toBeVisible();
  await expect(page.locator("main")).toContainText("with 1 more on the way");

  // Delete the list; after the toast commits, the totals are still there.
  await page.goto("/lists");
  await page.getByRole("button", { name: "Delete Garage" }).click();
  await page.getByRole("button", { name: "Dismiss" }).click();
  await page.goto("/stats");
  await expect(page.locator("main")).toContainText("Totals include lists you've deleted");
  await expect(page.getByText("♻️ Recycle")).toBeVisible();
});
