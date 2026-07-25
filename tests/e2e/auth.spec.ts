import { expect, test } from "@playwright/test";

test.describe("auth", () => {
  test("LoginButton opens a real sign-in dialog with a mode toggle", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "Đăng nhập" }).last().click();

    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mật khẩu")).toBeVisible();
    await expect(page.getByLabel("Tên hiển thị")).toHaveCount(0);

    await page.getByRole("button", { name: "Đăng ký" }).click();
    await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
    await expect(page.getByLabel("Tên hiển thị")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
  });

  test("submitting without Supabase configured fails gracefully instead of crashing", async ({ page }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "Đăng nhập" }).last().click();

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Mật khẩu").fill("password123");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).last().click();

    // No live Supabase project is configured in this test run — the dialog
    // must show a graceful inline error, not crash to Next's error overlay.
    await expect(page.getByText("Không phải lỗi của bạn đâu")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });
});
