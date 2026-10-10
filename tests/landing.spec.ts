import { expect, test } from "@playwright/test";

test("landing page loads and has a visible primary action", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Visibilio/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /analyze a page|sayfayı analiz et/i }).first(),
  ).toBeVisible();
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`layout stays within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const size = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(
      size.document,
      `Horizontal overflow at ${width}px: document ${size.document}px, viewport ${size.viewport}px`,
    ).toBeLessThanOrEqual(size.viewport);
  });
}

test("mobile navigation opens right-aligned instead of centered", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: /open navigation|menüyü aç|navigasyonu aç/i });
  const nav = page.locator("#landing-navigation");
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(nav).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const geometry = await nav.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width };
  });
  expect(geometry.right).toBeLessThanOrEqual(390);
  expect(geometry.width).toBeLessThanOrEqual(366);
  expect(geometry.left).toBeGreaterThan(0);
});
