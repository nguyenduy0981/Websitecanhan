import { expect, test } from "@playwright/test";

test.describe("gameplay flow", () => {
  test("completing an activity reaches the result screen", async ({ page }) => {
    await page.goto("/play/diem-danh");
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    await page.getByRole("button", { name: "Hoàn thành" }).click();
    await expect(page.getByRole("heading", { name: "Xong xuôi!" })).toBeVisible();
  });

  test("exit confirm dialog appears when leaving mid-session", async ({ page }) => {
    await page.goto("/play/diem-danh");
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    await page.getByRole("button", { name: "Thoát" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
