import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/explore", "/profile", "/leaderboard", "/play/diem-danh"];
const WIDTHS = [390, 1024, 1440];

test.describe("navigation", () => {
  test("sidebar links navigate to every real route", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const sidebar = page.getByRole("navigation", { name: "Điều hướng chính" });
    await sidebar.getByRole("link", { name: "Khám phá" }).click();
    await expect(page).toHaveURL(/\/explore$/);
    await sidebar.getByRole("link", { name: "Xếp hạng" }).click();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await sidebar.getByRole("link", { name: "Hồ sơ" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await sidebar.getByRole("link", { name: "Trang chủ" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px across all routes`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ROUTES) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        );
        expect(overflow, `${path} overflows at ${width}px`).toBe(false);
      }
    });
  }
});
