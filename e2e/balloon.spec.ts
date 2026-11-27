import { expect, test } from "@playwright/test";
import { showTab } from "./helpers";

test("let go to rise: altitude, sandbags, level-up and postcards", async ({ page }) => {
  await page.goto("/list");
  await page.getByLabel("Name of list").fill("Drawer");
  for (const item of ["Cables", "Batteries", "Coins", "Keys"]) {
    await page.getByLabel("Items", { exact: true }).fill(item);
    await page.getByLabel("Items", { exact: true }).press("Enter");
  }
  await page.getByRole("link", { name: /start sorting/i }).click();
  for (const choice of ["let go", "let go", "let go", "keep"]) {
    await page.getByRole("button", { name: new RegExp(`^\\W*${choice}$`, "i") }).click();
    await page.waitForTimeout(400);
  }

  // 4 decisions + a finished list = 19 lift: up from the rooftops to the treetops.
  await expect(page.getByRole("status").filter({ hasText: "You've risen to treetops" })).toBeVisible();

  await page.getByRole("link", { name: /see results/i }).click();
  await showTab(page, "Let go");
  await expect(page.getByRole("img", { name: /with 3 sandbags to drop/i })).toBeVisible();
  await page.getByRole("checkbox", { name: "Mark Cables as gone" }).check();
  await expect(page.getByRole("img", { name: /with 2 sandbags to drop/i })).toBeVisible();

  await page.goto("/stats");
  await expect(page.getByRole("heading", { name: "Your journey" })).toBeVisible();
  await expect(page.locator("main")).toContainText("Treetops");
  await expect(page.locator('[aria-current="step"]').filter({ hasText: "Treetops" })).toContainText("you are here");
  const postcards = page.locator("section", { has: page.getByRole("heading", { name: "Postcards" }) });
  await expect(postcards).toContainText("Drawer");
  await expect(postcards).toContainText("3 let go");
});
