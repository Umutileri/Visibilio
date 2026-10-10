import { expect, test } from "@playwright/test";

test("landing page loads and has a visible primary action", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Visibilio/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /analyze a page|sayfayı analiz et/i }).first(),
  ).toBeVisible();
});

test("landing page does not overflow horizontally on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile viewport regression check");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.document,
    `Document overflows viewport: ${dimensions.document}px > ${dimensions.viewport}px`,
  ).toBeLessThanOrEqual(dimensions.viewport);
});

test("mobile navigation opens as a navigation panel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile navigation check");
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: /open navigation|menüyü aç|navigasyonu aç/i });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#landing-navigation")).toBeVisible();
});
