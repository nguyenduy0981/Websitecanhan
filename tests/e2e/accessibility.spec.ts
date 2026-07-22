import { expect, test } from "@playwright/test";

test.describe("accessibility", () => {
  test("skip link is the first Tab stop and jumps focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Nhảy thẳng vào nội dung");
    await page.keyboard.press("Enter");
    await expect(page.locator(":focus")).toHaveId("main-content");
  });

  test("dialog returns focus to its trigger on close", async ({ page }) => {
    await page.goto("/vo-tri-styleguide");
    const trigger = page.getByRole("button", { name: "Mở Dialog" });
    await trigger.focus();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test("every button-shaped CTA responds to a click (no dead buttons)", async ({ page }) => {
    await page.goto("/profile");
    // Regression test for a real bug found in audit: this button had no
    // onClick at all and did nothing when clicked.
    await page.getByRole("button", { name: "Đăng nhập" }).last().click();
    // Radix Toast renders both the visible card and a visually-hidden
    // aria-live announcer with the same text — .first() is the visible one.
    await expect(page.getByText("Đăng nhập chưa có ở đây").first()).toBeVisible();
  });
});
