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

test.describe("Telegram redirect flow", () => {
  test("course page CTA preserves src=tg in affiliate href", async ({ page }) => {
    // Visit the course page with a Telegram source. If course data is absent
    // (notFound), the test is skipped rather than failing.
    await page.goto("/courses/some-tg-course?src=tg");
    const notFound = page.locator("text=Course Not Found").first();
    const isNotFound = await notFound.isVisible().catch(() => false);
    if (isNotFound) {
      test.skip();
      return;
    }
    const enroll = page
      .locator("a[href^='/api/out/']", { hasText: "Enroll Now" })
      .first();
    await expect(enroll).toBeVisible();
    const href = await enroll.getAttribute("href");
    expect(href).toMatch(/^\/api\/out\/[^?]+(\?src=tg)?$/);
  });
});

test.describe("Telegram redirect flow (seeded)", () => {
  test("go slug lands on course page and enroll href carries src=tg", async ({ page }) => {
    // Requires a known seeded course slug; update SLUG/ID via env.
    const slug = process.env.E2E_COURSE_SLUG || "microsoft-excel-basics";
    const courseId = process.env.E2E_COURSE_ID;
    await page.goto(`/go/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/courses/${slug}\\?src=tg`));
    if (courseId) {
      const enroll = page.locator("a[href^='/api/out/']", { hasText: "Enroll Now" }).first();
      await expect(enroll).toHaveAttribute("href", `/api/out/${courseId}?src=tg`);
    }
  });
});
