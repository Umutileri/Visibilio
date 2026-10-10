import { expect, test } from "@playwright/test";

test("landing page loads with the shared Inter typography", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Visibilio/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /analyze a page|sayfayı analiz et/i }).first(),
  ).toBeVisible();

  await expect(
    page.locator('link[rel="stylesheet"][href*="fonts.googleapis.com/css2?family=Inter"]'),
  ).toHaveCount(1);
  await expect
    .poll(() =>
      page.locator(".landing-page").evaluate((element) =>
        getComputedStyle(element).fontFamily.includes("Inter"),
      ),
    )
    .toBe(true);
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
  const menuButton = page.locator(".landing-menu-button");
  const nav = page.locator("#landing-navigation");
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
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

test("app shell keeps its typography and box sizing scoped to the app route", async ({ page }) => {
  await page.goto("/#app/overview");
  const app = page.locator(".saas-app");
  await expect(app).toBeVisible();

  const style = await app.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      fontFamily: computed.fontFamily,
      boxSizing: computed.boxSizing,
      backgroundColor: computed.backgroundColor,
    };
  });

  expect(style.fontFamily).toContain("Inter");
  expect(style.boxSizing).toBe("border-box");
  expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

test("landing page does not inherit legacy marketing shell selectors", async ({ page }) => {
  await page.goto("/");
  const result = await page.locator(".landing-page").evaluate((element) => {
    const nav = element.querySelector(".landing-nav") as HTMLElement | null;
    const brand = element.querySelector(".landing-brand") as HTMLElement | null;
    if (!nav || !brand) return null;
    return {
      navPosition: getComputedStyle(nav).position,
      navDisplay: getComputedStyle(nav).display,
      brandDisplay: getComputedStyle(brand).display,
      width: nav.getBoundingClientRect().width,
    };
  });

  expect(result).not.toBeNull();
  expect(result?.navDisplay).toBe("grid");
  expect(result?.brandDisplay).toBe("flex");
  expect(result?.width).toBeGreaterThan(0);
});

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`app shell stays within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#app/overview");
    await expect(page.locator(".saas-app")).toBeVisible();
    const size = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(
      size.document,
      `App shell horizontal overflow at ${width}px: document ${size.document}px, viewport ${size.viewport}px`,
    ).toBeLessThanOrEqual(size.viewport);
  });
}

test("app mobile navigation opens as a left-aligned list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#app/overview");
  const menuButton = page.locator(".mobile-nav-toggle");
  const nav = page.locator("#primary-navigation");
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(nav).toHaveClass(/is-mobile-open/);
  const geometry = await nav.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const link = element.querySelector("a") as HTMLElement | null;
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      display: getComputedStyle(element).display,
      linkAlign: link ? getComputedStyle(link).textAlign : null,
    };
  });
  expect(geometry.display).not.toBe("none");
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(390);
  expect(geometry.linkAlign).toBe("left");
});


test("mobile FAQ uses readable contrast on its light surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const faq = page.locator(".landing-faq-section");
  await expect(faq).toBeVisible();
  const styles = await faq.evaluate((section) => {
    const question = section.querySelector(".landing-faq-list summary") as HTMLElement;
    const answer = section.querySelector(".landing-faq-list details p") as HTMLElement;
    return {
      background: getComputedStyle(section).backgroundColor,
      questionColor: getComputedStyle(question).color,
      answerColor: getComputedStyle(answer).color,
    };
  });
  expect(styles.background).toBe("rgb(242, 246, 243)");
  expect(styles.questionColor).toBe("rgb(21, 45, 53)");
  expect(styles.answerColor).toBe("rgb(21, 45, 53)");
});

test("mobile feature and evidence cards do not reserve viewport-sized blank space", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const step = page.locator(".landing-feature-step").nth(1);
  const art = step.locator(".landing-feature-art");
  await expect(art).toBeVisible();
  const metrics = await step.evaluate((element) => ({
    stepHeight: element.getBoundingClientRect().height,
    artHeight: element.querySelector(".landing-feature-art")!.getBoundingClientRect().height,
    minHeight: getComputedStyle(element).minHeight,
  }));
  expect(metrics.minHeight).toBe("0px");
  expect(metrics.stepHeight).toBeLessThan(900);
  expect(metrics.artHeight).toBeGreaterThan(200);
});

test("mobile evidence inspector metrics render as separate readable cards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const inspector = page.locator(".evidence-inspector").first();
  await expect(inspector).toBeVisible();
  const metrics = await inspector.evaluate((element) => {
    const cards = [...element.children].map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        display: getComputedStyle(card).display,
        label: card.querySelector("small")?.getBoundingClientRect().width ?? 0,
      };
    });
    return { columns: getComputedStyle(element).gridTemplateColumns, cards };
  });
  expect(metrics.columns.split(" ").length).toBe(2);
  expect(metrics.cards.length).toBe(4);
  expect(metrics.cards.every((card) => card.width > 100 && card.height >= 70)).toBe(true);
});
