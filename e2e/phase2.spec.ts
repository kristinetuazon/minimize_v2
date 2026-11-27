import { expect, test } from "@playwright/test";

// 1×1 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

test.beforeEach(async ({ page }) => {
  // Force the copy-to-clipboard path instead of the OS share sheet.
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "share", { value: undefined, configurable: true });
  });
});

test("multiple lists: create, switch and delete", async ({ page }) => {
  await page.goto("/list");
  await page.getByRole("button", { name: "Closet" }).click();
  await expect(page.getByText("8 items")).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "New list" }).click();
  await expect(page).toHaveURL(/\/list$/);
  await expect(page.getByLabel("Name of list")).toHaveValue("");
  await page.getByRole("button", { name: "Bookshelf" }).click();

  await page.getByRole("link", { name: "Your lists" }).click();
  await expect(page.getByRole("button", { name: /^closet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^bookshelf/i })).toBeVisible();

  // Open the first list again: unsorted, so it resumes at the sort step.
  await page.getByRole("button", { name: /^closet/i }).click();
  await expect(page).toHaveURL(/\/sort$/);
  await expect(page.getByRole("heading", { name: /sorting closet/i })).toBeVisible();

  await page.goto("/lists");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete Bookshelf" }).click();
  await expect(page.getByRole("button", { name: /^bookshelf/i })).toHaveCount(0);
});

test("a blank new list doesn't clutter the lists page", async ({ page }) => {
  await page.goto("/list");
  await page.getByRole("button", { name: "Moving" }).click();
  await page.goto("/");
  await page.getByRole("button", { name: "New list" }).click();
  await page.goto("/lists");
  await expect(page.locator("main li")).toHaveCount(1);
});

test("photos: add, persist, show on the card, remove", async ({ page }) => {
  await page.goto("/list");
  await page.getByLabel("Items").fill("Lamp");
  await page.getByLabel("Items").press("Enter");

  await page.locator('input[type="file"]').setInputFiles({ name: "lamp.png", mimeType: "image/png", buffer: PNG });
  const thumb = page.locator("main li img");
  await expect(thumb).toBeVisible();

  await page.reload();
  await expect(page.locator("main li img")).toBeVisible();

  await page.getByRole("link", { name: /start sorting/i }).click();
  await expect(page.getByRole("group", { name: "Lamp" }).locator("img")).toBeVisible();

  await page.goto("/list");
  await page.getByRole("button", { name: "Remove photo for Lamp" }).click();
  await expect(page.locator("main li img")).toHaveCount(0);
});

test("export CSV and share an invite link that imports", async ({ page, context, browser }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/list");
  await page.getByLabel("Name of list").fill('Desk, "top" drawer');
  await page.getByLabel("Items").fill("Stapler");
  await page.getByLabel("Items").press("Enter");
  await page.getByLabel("Items").fill("Pens");
  await page.getByLabel("Items").press("Enter");
  await page.getByRole("link", { name: /start sorting/i }).click();
  await page.getByRole("button", { name: /keep/i }).click();
  await expect(page.getByText("2 of 2")).toBeVisible();
  await page.getByRole("button", { name: /let go/i }).click();
  await expect(page.getByRole("heading", { name: /all sorted/i })).toBeVisible();
  await page.getByRole("link", { name: /see results/i }).click();
  await page.getByLabel("Plan for Pens").selectOption("donate");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download csv/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("desk-top-drawer.csv");
  const csv = await (await download.createReadStream()).toArray();
  expect(Buffer.concat(csv).toString()).toBe("Item,Decision,Plan,Done\nStapler,Keep,,\nPens,Let go,Donate,");

  await page.getByRole("button", { name: /copy results/i }).click();
  await expect(page.getByRole("status").filter({ hasText: /results copied/i })).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("Let go (1)\n• Pens → Donate");

  await page.getByRole("button", { name: /invite to sort/i }).click();
  await expect(page.getByRole("status").filter({ hasText: /invite link copied/i })).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/import#/);

  // Someone else opens it in a fresh browser.
  const other = await browser.newContext();
  const friend = await other.newPage();
  await friend.goto(link);
  await expect(friend.getByRole("heading", { name: 'Desk, "top" drawer' })).toBeVisible();
  await expect(friend.getByText("2 items")).toBeVisible();
  await friend.getByRole("button", { name: /add & start sorting/i }).click();
  await expect(friend).toHaveURL(/\/sort$/);
  await expect(friend.getByText("1 of 2")).toBeVisible();
  await other.close();
});

test("installable: manifest, icons and service worker", async ({ page, request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons as { src: string }[]) {
    const res = await request.get(icon.src);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }

  await page.goto("/");
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toMatch(/\/$/);
});
