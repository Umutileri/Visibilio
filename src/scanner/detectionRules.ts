import type { Page } from "playwright";
import type { UIssue, ViewportPreset } from "./types";

export interface DetectionContext {
  url: string;
  viewport: ViewportPreset;
  detectedAt: string;
  page: Page;
}

type RuleDefinition = (
  context: DetectionContext,
) => Promise<UIssue[]>;

function issueId(rule: string, viewport: ViewportPreset, suffix: string): string {
  return `${rule}.${viewport.name.toLowerCase()}.${suffix}`;
}

function selectorForElement(element: Element): string {
  if (element.id) {
    return `${element.tagName.toLowerCase()}#${CSS.escape(element.id)}`;
  }

  const classes = Array.from(element.classList).slice(0, 2);
  return classes.length
    ? `${element.tagName.toLowerCase()}.${classes
        .map((name) => CSS.escape(name))
        .join(".")}`
    : element.tagName.toLowerCase();
}

async function detectHorizontalOverflow(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const documentWidth = Math.max(
      documentElement.scrollWidth,
      documentElement.offsetWidth,
      body?.scrollWidth ?? 0,
      body?.offsetWidth ?? 0,
    );

    return {
      documentWidth,
      viewportWidth: window.innerWidth,
      horizontalOverflow: Math.max(0, documentWidth - window.innerWidth),
    };
  });

  if (overflow.horizontalOverflow <= 0) return [];

  return [
    {
      id: issueId("responsive.horizontal-overflow", viewport, "document"),
      rule: "responsive.horizontal-overflow",
      category: "responsive",
      title: "Horizontal overflow detected",
      severity:
        overflow.horizontalOverflow >= 48
          ? "high"
          : overflow.horizontalOverflow >= 16
            ? "medium"
            : "low",
      description:
        "The document extends beyond the visible viewport, so some content may require horizontal scrolling.",
      url,
      viewport,
      measurements: overflow,
      evidence: [
        {
          type: "measurement",
          metric: "horizontalOverflow",
          value: overflow.horizontalOverflow,
          unit: "px",
        },
      ],
      detectedAt,
      status: "open",
    },
  ];
}

async function detectElementOverflow(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const findings = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          selector: selectorForElement(element),
          right: rect.right,
          left: rect.left,
          width: rect.width,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          position: window.getComputedStyle(element).position,
        };
      })
      .filter(
        (element) =>
          element.width > 0 &&
          element.position !== "fixed" &&
          (element.right > window.innerWidth || element.left < 0),
      ),
  );

  return findings.slice(0, 20).map((element, index) => {
    const overflowPixels =
      element.right > viewport.width
        ? Math.ceil(element.right - viewport.width)
        : Math.ceil(-element.left);
    return {
      id: issueId("responsive.element-overflow", viewport, String(index + 1)),
      rule: "responsive.element-overflow",
      category: "responsive" as const,
      title: "Element extends beyond the viewport",
      severity:
        overflowPixels >= 48
          ? ("high" as const)
          : overflowPixels >= 16
            ? ("medium" as const)
            : ("low" as const),
      description:
        "This rendered element extends outside the visible viewport at this viewport size.",
      url,
      viewport,
      selector: element.selector,
      measurements: {
          overflowPixels,
        elementWidth: element.width,
        elementLeft: element.left,
        elementRight: element.right,
        viewportWidth: viewport.width,
      },
      evidence: [
        {
          type: "measurement" as const,
          metric: "overflowPixels",
          value: overflowPixels,
          unit: "px" as const,
        },
      ],
      detectedAt,
      status: "open" as const,
    };
  });
}

async function detectImageAltIssues(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const findings = await page.evaluate(() =>
    Array.from(document.images).map((image) => ({
      selector: selectorForElement(image),
      hasAltAttribute: image.hasAttribute("alt"),
      isDecorative: image.getAttribute("role") === "presentation",
    })),
  );

  return findings
    .filter((image) => !image.hasAltAttribute && !image.isDecorative)
    .map((image, index) => ({
      id: issueId(
        "accessibility.image-missing-alt",
        viewport,
        String(index + 1),
      ),
      rule: "accessibility.image-missing-alt",
      category: "accessibility" as const,
      title: "Image is missing an alt attribute",
      severity: "medium" as const,
      description:
        "An image element does not define alt text. Decorative images should still use an empty alt attribute.",
      url,
      viewport,
      selector: image.selector,
      detectedAt,
      status: "open" as const,
    }));
}

async function detectFormControlNames(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const findings = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea"),
    )
      .filter((control) => control.type !== "hidden")
      .map((control) => ({
        selector: selectorForElement(control),
        hasName: Boolean(control.getAttribute("name")),
        hasLabel: Boolean(control.labels && control.labels.length > 0),
        hasAriaLabel: Boolean(
          control.getAttribute("aria-label") ||
            control.getAttribute("aria-labelledby"),
        ),
      }))
      .filter((control) => !control.hasLabel && !control.hasAriaLabel),
  );

  return findings
    .filter((control) => !control.hasName)
    .map((control, index) => ({
      id: issueId(
        "accessibility.form-control-name",
        viewport,
        String(index + 1),
      ),
      rule: "accessibility.form-control-name",
      category: "accessibility" as const,
      title: "Form control has no programmatic name",
      severity: "medium" as const,
      description:
        "A form control has no name and no associated label or accessible naming attribute.",
      url,
      viewport,
      selector: control.selector,
      detectedAt,
      status: "open" as const,
    }));
}

async function detectHtmlLanguage(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const missingLang = await page.evaluate(
    () => !document.documentElement.getAttribute("lang")?.trim(),
  );

  if (!missingLang) return [];

  return [
    {
      id: issueId("accessibility.html-lang", viewport, "missing"),
      rule: "accessibility.html-lang",
      category: "accessibility",
      title: "Document is missing a language",
      severity: "low",
      description:
        "The root html element does not define a lang attribute, which can make language interpretation less reliable for assistive technology.",
      url,
      viewport,
      selector: "html",
      detectedAt,
      status: "open",
    },
  ];
}

export const detectionRules: RuleDefinition[] = [
  detectHorizontalOverflow,
  detectElementOverflow,
  detectImageAltIssues,
  detectFormControlNames,
  detectHtmlLanguage,
];

export async function runDetectionRules(
  context: DetectionContext,
): Promise<UIssue[]> {
  const issueGroups = await Promise.all(
    detectionRules.map((rule) => rule(context)),
  );

  return issueGroups.flat();
}
