import { test, expect } from "@playwright/test";

test.describe("Public page shells render", () => {
  test("homepage renders nav and main content area", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("courses page renders structural shell", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("roadmaps page renders structural shell", async ({ page }) => {
    await page.goto("/roadmaps");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });
});
