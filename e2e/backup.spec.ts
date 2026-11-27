import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// 1×1 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

test("back up everything (with photos) and restore it on a fresh device", async ({ page, browser }) => {
  await page.goto("/list");
  await page.getByLabel("Name of list").fill("Attic");
  await page.getByLabel("Items", { exact: true }).fill("Trunk");
  await page.getByLabel("Items", { exact: true }).press("Enter");
  await page.locator('input[type="file"]').first().setInputFiles({ name: "trunk.png", mimeType: "image/png", buffer: PNG });
  await expect(page.locator("main li img")).toBeVisible();

  await page.goto("/stats");
  const data = page.locator("#your-data");
  await expect(data).toContainText("Never backed up");
  await expect(data).not.toContainText("Checking storage");

  const downloadPromise = page.waitForEvent("download");
  await data.getByRole("button", { name: /download backup/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^minimize-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  const json = JSON.parse(readFileSync(path, "utf8"));
  expect(json.app).toBe("minimize");
  expect(Object.keys(json.photos)).toHaveLength(1);
  await expect(data).toContainText("Last backup: today");

  // A brand-new device: empty, but restore is right there.
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto("/stats");
  await expect(other.getByText(/nothing sorted yet/i)).toBeVisible();
  other.once("dialog", (d) => d.accept());
  await other.getByLabel("Backup file").setInputFiles(path);
  await expect(other.getByRole("status").filter({ hasText: "Restored 1 list" })).toBeVisible();

  await other.goto("/lists");
  await other.getByRole("button", { name: /^attic/i }).click();
  await other.goto("/list");
  await expect(other.getByRole("button", { name: "Rename Trunk" })).toBeVisible();
  await expect(other.locator("main li img")).toBeVisible();
  await fresh.close();
});

test("a file that isn't a backup is rejected without changing anything", async ({ page }) => {
  await page.goto("/stats");
  await page.getByLabel("Backup file").setInputFiles({
    name: "notes.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"hello": "world"}'),
  });
  await expect(page.getByRole("status").filter({ hasText: "isn't a Minimize backup" })).toBeVisible();
});

test("home nudges you to back up once you have a couple of lists", async ({ page }) => {
  for (const t of ["Closet", "Bookshelf"]) {
    await page.goto("/");
    await page.getByRole("button", { name: /new list|start a list/i }).first().click();
    await page.getByRole("button", { name: t }).click();
  }
  await page.goto("/");
  await expect(page.getByText("Your lists only live on this device.")).toBeVisible();
  await page.getByRole("link", { name: "Make a backup" }).click();
  await expect(page).toHaveURL(/\/stats#your-data$/);
});

test("about page: why Minimize, your data, and a link to the portfolio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About Minimize" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "Why Minimize" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your data stays with you" })).toBeVisible();
  const portfolio = page.getByRole("link", { name: /see my portfolio/i });
  await expect(portfolio).toHaveAttribute("href", "https://www.kristinecodes.dev");
  await expect(portfolio).toHaveAttribute("target", "_blank");
});
