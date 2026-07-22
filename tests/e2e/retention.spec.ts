import { expect, test } from "@playwright/test";

test.describe("retention system", () => {
  test("Home shows today's daily quests with an honest logged-out state", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Nhiệm vụ hôm nay" })).toBeVisible();
    // .last() — Sidebar's check-in button shares the same label text.
    await expect(page.getByText("Điểm danh hôm nay").last()).toBeVisible();
    // Not logged in — no fabricated progress, just the honest note, per CLAUDE.md's no-fabricated-data rule.
    await expect(page.getByText("Đăng nhập để theo dõi tiến độ nhiệm vụ này.").first()).toBeVisible();
  });

  test("claiming a ready quest opens the reward + celebration dialog", async ({ page }) => {
    await page.goto("/vo-tri-styleguide");
    const readyClaim = page.getByRole("button", { name: "Nhận thưởng" }).and(page.locator(":not([disabled])")).first();
    await readyClaim.scrollIntoViewIfNeeded();
    await readyClaim.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Đã hoàn thành!")).toBeVisible();
    await expect(dialog.getByText(/điểm/)).toBeVisible();
    await expect(dialog.getByText(/XP/)).toBeVisible();
  });
});
