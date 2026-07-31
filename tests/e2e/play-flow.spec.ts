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

test.describe("gameplay engine", () => {
  test("combo scoring accumulates and shows on the lose result", async ({ page }) => {
    await page.goto("/play/diem-danh");
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    const addComboScore = page.getByRole("button", { name: /Thử cộng điểm/ });
    await addComboScore.click();
    await addComboScore.click();
    await expect(page.getByText("Combo x2")).toBeVisible();

    await page.getByRole("button", { name: "Thử thua" }).click();
    await expect(page.getByRole("heading", { name: "Chưa thắng lần này" })).toBeVisible();
    await expect(page.getByText(/Combo cao nhất x2/)).toBeVisible();
    // Retry is the emphasized (primary) action on a lose result, per the
    // Result Pipeline's kind-aware CTA swap — "Về Khám phá" stays outline.
    await expect(page.getByRole("button", { name: "Chơi lại" })).toBeVisible();
  });
});
