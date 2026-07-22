import { expect, test } from "@playwright/test";

test.describe("explore", () => {
  test("search filters the activity grid", async ({ page }) => {
    await page.goto("/explore");
    const grid = page.locator("#activity-grid");
    const initialCount = await grid.getByRole("button").count();
    expect(initialCount).toBeGreaterThan(0);

    await page.getByPlaceholder(/tìm|Tìm/i).fill("zzzz-không-tồn-tại-zzzz");
    await expect(page.getByText(/Tìm hoài không ra/i)).toBeVisible();

    await page.getByPlaceholder(/tìm|Tìm/i).fill("");
    await expect(grid.getByRole("button").first()).toBeVisible();
  });

  test("activity detail sheet opens from a card", async ({ page }) => {
    await page.goto("/explore");
    // Scoped to the actual card grid, not the search bar/category chips
    // that come before it inside the same #activity-grid section.
    await page.locator("#activity-grid .grid").getByRole("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
