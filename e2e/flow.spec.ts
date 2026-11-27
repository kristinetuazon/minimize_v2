import { showTab } from "./helpers";
import { expect, test, type Page } from "@playwright/test";

async function pasteItems(page: Page, text: string) {
  const input = page.getByLabel("Items", { exact: true });
  await input.focus();
  // Fire a real paste event with clipboard data.
  await input.evaluate((el, value) => {
    const data = new DataTransfer();
    data.setData("text/plain", value);
    el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  }, text);
}

test("list → sort → act, with maybe, undo and persistence", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start a list" }).click();
  await expect(page).toHaveURL(/\/list$/);

  // Can't continue with an empty list.
  await expect(page.getByRole("button", { name: /start sorting/i })).toBeDisabled();

  await page.getByLabel("Name of list").fill("Closet");
  await pasteItems(page, "Jeans\nWinter coat\nOld hoodie");
  await page.getByLabel("Items", { exact: true }).fill("Sneakers");
  await page.getByLabel("Items", { exact: true }).press("Enter");
  await expect(page.getByText("4 items", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /start sorting/i }).click();
  await expect(page).toHaveURL(/\/sort$/);
  await expect(page.getByText("1 of 4")).toBeVisible();

  // Jeans → keep, Winter coat → let go, then undo and choose maybe.
  await page.getByRole("button", { name: /keep/i }).click();
  await expect(page.getByText("2 of 4")).toBeVisible();
  await page.getByRole("button", { name: /let go/i }).click();
  await expect(page.getByText("3 of 4")).toBeVisible();
  await page.getByRole("button", { name: /undo/i }).click();
  await expect(page.getByText("2 of 4")).toBeVisible();
  await page.getByRole("button", { name: /maybe/i }).click();

  // Keyboard works too.
  await page.keyboard.press("ArrowLeft"); // Old hoodie → let go
  await expect(page.getByText("4 of 4")).toBeVisible();
  await page.keyboard.press("ArrowRight"); // Sneakers → keep

  // Maybe round.
  await expect(page.getByRole("heading", { name: /almost there/i })).toBeVisible();
  await page.getByRole("button", { name: /decide on maybes/i }).click();
  await expect(page.getByRole("group", { name: "Winter coat" })).toBeVisible();
  await page.getByRole("button", { name: /let go/i }).click();
  await expect(page.getByRole("heading", { name: /all sorted/i })).toBeVisible();

  await page.getByRole("link", { name: /see results/i }).click();
  await expect(page).toHaveURL(/\/results$/);
  const letGo = page.locator("section", { has: page.getByRole("heading", { name: /let go/i }) });
  await expect(letGo.getByText("Winter coat")).toBeVisible();
  await expect(letGo.getByText("Old hoodie")).toBeVisible();

  await page.getByLabel("Plan for Winter coat").selectOption("donate");
  await letGo.getByRole("checkbox", { name: "Mark Winter coat as gone" }).check();
  await expect(letGo.getByText("1 / 2")).toBeVisible();

  // Everything survives a reload.
  await page.reload();
  await showTab(page, "Let go");
  await expect(page.getByLabel("Plan for Winter coat")).toHaveValue("donate");
  await expect(letGo.getByText("1 / 2")).toBeVisible();
  await showTab(page, "Keep");
  const keep = page.locator("section", { has: page.getByRole("heading", { name: /^keep/i }) });
  await expect(keep.getByText("Jeans")).toBeVisible();
  await expect(keep.getByText("Sneakers")).toBeVisible();
});

test("templates fill an empty list", async ({ page }) => {
  await page.goto("/list");
  await page.getByRole("button", { name: "Weekend trip" }).click();
  await expect(page.getByLabel("Name of list")).toHaveValue("Weekend trip");
  await expect(page.getByText("8 items", { exact: true })).toBeVisible();
});

test("sort page with no items points back to the list", async ({ page }) => {
  await page.goto("/sort");
  await expect(page.getByText(/your list is empty/i)).toBeVisible();
});
