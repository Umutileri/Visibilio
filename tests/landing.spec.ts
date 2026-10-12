import { expect, test } from "@playwright/test";

test("product-led landing page exposes its main story and working navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Visibilio/i);
  await expect(page.getByRole("heading", { name: /your ui has blind spots/i })).toBeVisible();
  await expect(page.locator(".v2-product-stage")).toBeVisible();
  await expect(page.locator(".v2-workflow-card")).toHaveCount(3);
  await expect(page.locator(".v2-url-form")).toBeVisible();
  await expect(page.locator(".landing-faq-section")).toBeVisible();
});

test("marketing copy is transparent about early access", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".v2-url-form small")).toContainText(/early access/i);
  await expect(page.locator(".landing-faq-list")).toContainText(/paid plans and public scan availability are not live yet/i);
});

for (const width of [320,375,390,430,768,1024,1440]) {
  test(`landing page has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    const dimensions = await page.evaluate(() => ({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  });
}

test("language switcher retains English and Turkish navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", {name:"TR", exact:true}).click();
  await expect(page.locator(".landing-nav")).toContainText("Nasıl çalışır");
  await page.getByRole("button", {name:"EN", exact:true}).click();
  await expect(page.locator(".landing-nav")).toContainText("How it works");
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



test("refined landing close has a clean navbar, FAQ and prominent final CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-nav-wrap")).toBeVisible();
  await expect(page.locator(".landing-final-simple")).toBeVisible();
  await expect(page.locator(".landing-final-main-action")).toBeVisible();
  await expect(page.locator(".landing-footer-refined")).toBeVisible();
  await expect(page.locator(".landing-final-action")).toHaveCount(0);
  await expect(page.locator(".landing-faq-list details")).toHaveCount(6);
});

test("final CTA and footer remain usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".landing-final-main-action")).toBeVisible();
  await expect(page.locator(".landing-footer-refined")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("FAQ uses a plain heading with no kicker dot or legacy badge", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-faq-title .landing-section-kicker")).toHaveCount(0);
  await expect(page.locator(".landing-faq-title .landing-faq-heading")).toBeVisible();
  await expect(page.locator(".landing-faq-list summary .faq-question").first()).toHaveCSS("color", "rgb(40, 33, 47)");
});

test("final CTA is a simple text-led close without decorative logo cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-final-simple")).toBeVisible();
  await expect(page.locator(".landing-final-card")).toHaveCount(0);
  await expect(page.locator(".final-aside-mark")).toHaveCount(0);
  await expect(page.locator(".landing-final-main-action")).toBeVisible();
});

test("premium navbar keeps links centered and stays within viewport", async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    await expect(page.locator(".landing-nav")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  }
});

test("FAQ heading stays sticky while its questions scroll past, then leaves with the section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#faq");
  const heading = page.locator(".landing-faq-title");
  const section = page.locator(".landing-faq-section");
  await expect(heading).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, document.querySelector("#faq")!.getBoundingClientRect().top + window.scrollY + 120));
  const stickyPosition = await heading.evaluate((el) => getComputedStyle(el).position);
  expect(stickyPosition).toBe("sticky");

  const titleRect = await heading.boundingBox();
  const sectionRect = await section.boundingBox();
  expect(titleRect).not.toBeNull();
  expect(sectionRect).not.toBeNull();

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const endRect = await heading.boundingBox();
  const endSectionRect = await section.boundingBox();
  expect(endRect).not.toBeNull();
  expect(endSectionRect).not.toBeNull();
  expect(endRect!.y).toBeLessThan(endSectionRect!.y + endSectionRect!.height + 2);
});

test("opening FAQ answers does not tilt, translate, or animate rows", async ({ page }) => {
  await page.goto("/#faq");
  const item = page.locator(".landing-faq-list details").nth(1);
  await item.locator("summary").click();
  await expect(item).toHaveAttribute("open", "");
  const transforms = await item.evaluate((el) => {
    const summary = el.querySelector("summary")!;
    const answer = el.querySelector("p")!;
    return [el, summary, answer].map((node) => ({
      transform: getComputedStyle(node).transform,
      transition: getComputedStyle(node).transitionDuration,
    }));
  });
  for (const style of transforms) {
    expect(style.transform).toBe("none");
    expect(parseFloat(style.transition)).toBe(0);
  }
});

test("hero contains no oversized grey decorative orb", async ({ page }) => {
  await page.goto("/");
  const circles = await page.locator(".landing-hero, .landing-hero-visual").evaluateAll((nodes) =>
    nodes.flatMap((node) => ["::before", "::after"].map((pseudo) => {
      const style = getComputedStyle(node, pseudo);
      return { display: style.display, content: style.content, background: style.backgroundColor };
    }))
  );
  expect(circles.every((x) => x.display === "none" || x.content === "none")).toBeTruthy();
});


test("FAQ title is centered and question typography is restrained", async ({ page }) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto("/#faq");
  const title = page.locator(".landing-faq-title .landing-faq-heading");
  await expect(title).toBeVisible();
  const align = await title.evaluate((el) => getComputedStyle(el).textAlign);
  const titleRect = await title.boundingBox();
  const colRect = await page.locator(".landing-faq-title").boundingBox();
  expect(align).toBe("center");
  expect(titleRect).not.toBeNull();
  expect(colRect).not.toBeNull();
  expect(Math.abs((titleRect!.x + titleRect!.width / 2) - (colRect!.x + colRect!.width / 2))).toBeLessThan(2);
  const fontSize = await page.locator(".landing-faq-list summary").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeLessThanOrEqual(16);
});

test("V2 hero has no oversized circular decoration and uses a flat dark background", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator(".v2-hero");
  await expect(hero).toBeVisible();
  const styles = await hero.evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    after: getComputedStyle(el, "::after").content,
    glow: getComputedStyle(el.querySelector(".v2-stage-glow")!).display,
  }));
  expect(styles.background).toBe("rgb(9, 8, 11)");
  expect(styles.after).toBe("none");
  expect(styles.glow).toBe("none");
});

test("primary hero button uses a violet center-out hover fill", async ({ page }) => {
  await page.goto("/");
  const button = page.locator(".v2-button-primary");
  await expect(button).toBeVisible();
  const before = await button.evaluate((el) => getComputedStyle(el, "::before").clipPath);
  await button.hover();
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el, "::before").clipPath)).not.toBe(before);
  const after = await button.evaluate((el) => getComputedStyle(el, "::before").clipPath);
  expect(after).toContain("circle");
});
