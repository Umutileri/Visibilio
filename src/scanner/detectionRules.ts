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
      id: issueId(
        "responsive.horizontal-overflow",
        viewport,
        String(overflow.horizontalOverflow),
      ),
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

async function detectImageAltIssues(
  context: DetectionContext,
): Promise<UIssue[]> {
  const { page, url, viewport, detectedAt } = context;
  const findings = await page.evaluate(() =>
    Array.from(document.images).map((image) => ({
      selector: image.id
        ? `img#${CSS.escape(image.id)}`
        : image.className
          ? `img.${String(image.className).trim().split(/\\s+/)[0] ?? ""}`
          : "img",
      hasAltAttribute: image.hasAttribute("alt"),
    })),
  );

  return findings
    .filter((image) => !image.hasAltAttribute)
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
        selector: control.id
          ? `#${CSS.escape(control.id)}`
          : control.name
            ? `[name="${CSS.escape(control.name)}"]`
            : control.tagName.toLowerCase(),
        hasName: Boolean(control.getAttribute("name")),
        hasLabel: Boolean(
          control.labels && control.labels.length > 0,
        ),
        hasAriaLabel: Boolean(
          control.getAttribute("aria-label") ||
            control.getAttribute("aria-labelledby"),
        ),
      }))
      .filter((control) => !control.hasLabel && !control.hasAriaLabel);
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
