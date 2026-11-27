import { expect, test } from "@playwright/test";

const bg = () => getComputedStyle(document.body).backgroundColor;
const NIGHT_BG = "rgb(27, 24, 28)";
const DAY_BG = "rgb(246, 240, 241)";

test.describe("on a light device", () => {
  test.use({ colorScheme: "light" });

  test("night mode toggles, persists across reloads, and can go back", async ({ page }) => {
    await page.goto("/list");
    expect(await page.evaluate(bg)).toBe(DAY_BG);

    await page.getByRole("button", { name: "Switch to night mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect.poll(() => page.evaluate(bg)).toBe(NIGHT_BG);

    // Applied before paint on the next load, on every page.
    await page.goto("/lists");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("button", { name: "Switch to day mode" })).toBeVisible();

    // Back to day matches the device, so it returns to following the system.
    await page.getByRole("button", { name: "Switch to day mode" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    expect(await page.evaluate(() => localStorage.getItem("minimize:theme"))).toBeNull();
    await expect.poll(() => page.evaluate(bg)).toBe(DAY_BG);
  });
});

test.describe("on a dark device", () => {
  test.use({ colorScheme: "dark" });

  test("starts in night mode and can switch to day", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(bg)).toBe(NIGHT_BG);
    await page.getByRole("button", { name: "Switch to day mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect.poll(() => page.evaluate(bg)).toBe(DAY_BG);
    await page.reload();
    expect(await page.evaluate(bg)).toBe(DAY_BG);
  });
});
