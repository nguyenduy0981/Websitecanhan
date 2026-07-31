import { expect, test } from "@playwright/test";

test.describe("social foundation", () => {
  test("Home shows the honest empty ActivityFeed state (no fabricated feed items)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Cộng đồng đang làm gì" })).toBeVisible();
    await expect(page.getByText("Chưa có gì để xem ở đây")).toBeVisible();
  });
});
