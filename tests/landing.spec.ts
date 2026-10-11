import { expect, test } from "@playwright/test";


test("marketing copy does not promise public hosted scanning or a live free tier", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-final-section")).toContainText(/early access/i);
  await expect(page.locator(".landing-final-action small")).toContainText(/hosted scanning is not available/i);
  await expect(page.locator(".landing-faq-list")).toContainText(/paid plans and public scan availability are not live yet/i);
});

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


test("FAQ retains the intentional dark teal accent surface on every viewport", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const styles = await page.locator(".landing-faq-section").evaluate((section) => {
      const summary = section.querySelector(".landing-faq-list summary") as HTMLElement;
      const answer = section.querySelector(".landing-faq-list details p") as HTMLElement;
      return {
        background: getComputedStyle(section).backgroundColor,
        summary: getComputedStyle(summary).color,
        answer: getComputedStyle(answer).color,
      };
    });
    expect(styles.background).toBe("rgb(21, 45, 53)");
    expect(styles.summary).toBe("rgb(247, 251, 248)");
    expect(styles.answer).toBe("rgb(203, 222, 210)");
  }
});

test("evidence metric label, value and unit never overlap on mobile", async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const inspector = page.locator(".landing-demo-evidence .evidence-inspector").first();
    await expect(inspector).toBeVisible();
    const metrics = await inspector.evaluate((element) => {
      const cards = [...element.children].map((card) => {
        const label = card.querySelector("small")!.getBoundingClientRect();
        const value = card.querySelector("strong")!.getBoundingClientRect();
        const unit = card.querySelector("em")?.getBoundingClientRect();
        return {
          width: card.getBoundingClientRect().width,
          labelBottom: label.bottom,
          valueTop: value.top,
          valueRight: value.right,
          unitLeft: unit?.left ?? value.right,
          unitBottom: unit?.bottom ?? value.bottom,
          valueBottom: value.bottom,
        };
      });
      return {
        columns: getComputedStyle(element).gridTemplateColumns,
        cards,
      };
    });
    expect(metrics.columns.split(" ").length).toBe(2);
    expect(metrics.cards).toHaveLength(4);
    for (const card of metrics.cards) {
      expect(card.width).toBeGreaterThan(100);
      expect(card.valueTop).toBeGreaterThanOrEqual(card.labelBottom - 1);
      expect(card.unitLeft).toBeGreaterThanOrEqual(card.valueRight - 1);
      expect(card.unitBottom).toBeLessThanOrEqual(card.valueBottom + 1);
    }
  }
});

test("landing accent surfaces are balanced rather than globally dark", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const surfaces = await page.locator(".landing-page section").evaluateAll((sections) =>
    sections.map((section) => getComputedStyle(section).backgroundColor),
  );
  const darkSections = surfaces.filter((color) =>
    ["rgb(21, 45, 53)", "rgb(16, 37, 44)", "rgb(29, 32, 33)"].includes(color),
  ).length;
  expect(darkSections).toBeGreaterThan(0);
  expect(darkSections).toBeLessThan(surfaces.length);
});

test("mobile audience cards keep label, heading, copy and link in a clear vertical hierarchy", async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const cards = page.locator(".landing-audience-grid article");
    await expect(cards).toHaveCount(3);
    for (const card of await cards.all()) {
      const geometry = await card.evaluate((element) => {
        const label = element.querySelector(":scope > span")!.getBoundingClientRect();
        const heading = element.querySelector("h3")!.getBoundingClientRect();
        const copy = element.querySelector("p")!.getBoundingClientRect();
        const link = element.querySelector("a")!.getBoundingClientRect();
        return {
          cardWidth: element.getBoundingClientRect().width,
          labelBottom: label.bottom,
          headingTop: heading.top,
          headingBottom: heading.bottom,
          copyTop: copy.top,
          copyBottom: copy.bottom,
          linkTop: link.top,
          linkBottom: link.bottom,
          cardBottom: element.getBoundingClientRect().bottom,
        };
      });
      expect(geometry.cardWidth).toBeGreaterThan(260);
      expect(geometry.headingTop).toBeGreaterThan(geometry.labelBottom);
      expect(geometry.copyTop).toBeGreaterThanOrEqual(geometry.headingBottom - 1);
      expect(geometry.linkTop).toBeGreaterThanOrEqual(geometry.copyBottom - 1);
      expect(geometry.linkBottom).toBeLessThanOrEqual(geometry.cardBottom);
    }
  }
});

test("evidence section separates observed facts from AI interpretation at mobile widths", async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const cards = page.locator(".landing-evidence-contrast > div");
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      const geometry = await card.evaluate((element) => {
        const label = element.querySelector("small")!.getBoundingClientRect();
        const value = element.querySelector("strong")!.getBoundingClientRect();
        const meta = element.querySelector("span")!.getBoundingClientRect();
        const cardRect = element.getBoundingClientRect();
        return {
          width: cardRect.width,
          labelBottom: label.bottom,
          valueTop: value.top,
          valueBottom: value.bottom,
          metaTop: meta.top,
          metaBottom: meta.bottom,
          cardBottom: cardRect.bottom,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      });
      expect(geometry.width).toBeGreaterThan(260);
      expect(geometry.valueTop).toBeGreaterThanOrEqual(geometry.labelBottom - 1);
      expect(geometry.metaTop).toBeGreaterThanOrEqual(geometry.valueBottom - 1);
      expect(geometry.metaBottom).toBeLessThanOrEqual(geometry.cardBottom);
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    }
  }
});

test("product proof workflow is editorial and has no feature cards", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const list = page.locator(".landing-proof-editorial .landing-proof-list");
    await expect(list).toBeVisible();
    await expect(list.locator(":scope > li")).toHaveCount(3);
    const result = await list.evaluate((element) => ({
      tag: element.tagName,
      items: [...element.children].map((item) => ({
        tag: item.tagName,
        background: getComputedStyle(item).backgroundColor,
        borderRadius: getComputedStyle(item).borderRadius,
      })),
    }));
    expect(result.tag).toBe("OL");
    expect(result.items.every((item) => item.tag === "LI")).toBe(true);
    expect(result.items.every((item) => item.background === "rgba(0, 0, 0, 0)" || item.background === "transparent")).toBe(true);
    expect(result.items.every((item) => item.borderRadius === "0px")).toBe(true);
  }
});

test("landing editorial headings share one type scale and cardless sections stay unboxed", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const headings = [
      ".landing-hero-copy h1",
      ".landing-url-copy h2",
      ".landing-proof-heading h2",
      ".landing-audience-intro h2",
      ".landing-section-heading h2",
      ".landing-retest-story h2",
      ".landing-faq-title h2",
      ".landing-final-grid h2",
    ];
    const styles = await page.evaluate((selectors) => selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        weight: style.fontWeight,
        tracking: style.letterSpacing,
        fontFamily: style.fontFamily,
      };
    }), headings);
    expect(styles.every(Boolean)).toBe(true);
    expect(new Set(styles.map((item) => item!.weight)).size).toBe(1);
    expect(new Set(styles.map((item) => item!.tracking)).size).toBe(1);
    expect(new Set(styles.map((item) => item!.fontFamily)).size).toBe(1);

    const surfaces = await page.evaluate(() => {
      const selectors = [
        ".landing-proof-editorial .landing-proof-list li",
        ".landing-audience-grid article",
        ".landing-evidence-contrast > div",
      ];
      return selectors.flatMap((selector) => [...document.querySelectorAll(selector)].map((element) => {
        const style = getComputedStyle(element);
        return {
          radius: style.borderRadius,
          shadow: style.boxShadow,
        };
      }));
    });
    expect(surfaces.length).toBeGreaterThan(0);
    expect(surfaces.every((item) => item.radius === "0px" && item.shadow === "none")).toBe(true);
  }
});
