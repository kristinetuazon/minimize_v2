import { expect, test } from "@playwright/test";

// Chrome's built-in fake camera, with permission already granted.
test.use({
  launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] },
  permissions: ["camera"],
});

test("snap items with the in-app camera", async ({ page }) => {
  await page.goto("/list");
  await page.getByRole("button", { name: /snap items with the camera/i }).click();
  const camera = page.getByRole("dialog", { name: "Camera" });
  await expect(camera.getByRole("button", { name: "Take photo" })).toBeEnabled({ timeout: 10_000 });

  await camera.getByLabel("Name for the next photo").fill("Desk lamp");
  await camera.getByRole("button", { name: "Take photo" }).click();
  await expect(camera.getByRole("img", { name: "Desk lamp" })).toBeVisible();
  await camera.getByRole("button", { name: "Take photo" }).click();
  await expect(camera.getByRole("img", { name: "Item 2" })).toBeVisible();

  await camera.getByRole("button", { name: /done \(2\)/i }).click();
  await expect(camera).toHaveCount(0);
  await expect(page.getByText("2 items")).toBeVisible();
  await expect(page.getByRole("button", { name: "Rename Desk lamp" })).toBeVisible();
  await expect(page.locator("main li img")).toHaveCount(2);
});
