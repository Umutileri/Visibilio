import { chromium } from "playwright";
import { initialViewports } from "./viewports";
import type { ScanResult, UIssue, ViewportPreset } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;
const issueNow = () => new Date().toISOString();

function toIssue(
  url: string,
  viewport: ViewportPreset,
  overflow: number,
  detectedAt: string,
): UIssue | null {
  if (overflow <= 0) return null;

  return {
    id: `responsive.horizontal-overflow.${viewport.name.toLowerCase()}`,
    rule: "responsive.horizontal-overflow",
    category: "responsive",
    title: "Horizontal overflow detected",
    severity: overflow >= 48 ? "high" : overflow >= 16 ? "medium" : "low",
    description:
      "The document extends beyond the visible viewport, so some content may require horizontal scrolling.",
    url,
    viewport,
    measurements: {
      documentWidth: overflow + viewport.width,
      viewportWidth: viewport.width,
      horizontalOverflow: overflow,
    },
    evidence: [
      {
        type: "measurement",
        metric: "horizontalOverflow",
        value: overflow,
        unit: "px",
      },
    ],
    detectedAt,
    status: "open",
  };
}

export async function scanPage(
  url: string,
  viewport: ViewportPreset = initialViewports[0],
): Promise<ScanResult> {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: {
        width: viewport.width,
        height: viewport.height,
      },
    });

    page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT_MS,
      });

      const dimensions = await page.evaluate(() => {
        const documentElement = document.documentElement;
        const body = document.body;

        const documentWidth = Math.max(
          documentElement.scrollWidth,
          documentElement.offsetWidth,
          body?.scrollWidth ?? 0,
          body?.offsetWidth ?? 0,
        );

        const documentHeight = Math.max(
          documentElement.scrollHeight,
          documentElement.offsetHeight,
          body?.scrollHeight ?? 0,
          body?.offsetHeight ?? 0,
        );

        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          documentWidth,
          documentHeight,
          horizontalOverflow: Math.max(0, documentWidth - window.innerWidth),
        };
      });

      const detectedAt = issueNow();
      const issue = toIssue(url, viewport, dimensions.horizontalOverflow, detectedAt);

      return {
        ok: true,
        url,
        viewport,
        dimensions,
        issues: issue ? [issue] : [],
      };
    } catch (error) {
      const isTimeout = error instanceof Error && /timeout/i.test(error.message);

      return {
        ok: false,
        url,
        viewport,
        error: {
          code: isTimeout ? "TIMEOUT" : "PAGE_ERROR",
          message: error instanceof Error ? error.message : "Unknown page error",
        },
      };
    }
  } catch (error) {
    return {
      ok: false,
      url,
      viewport,
      error: {
        code: "BROWSER_ERROR",
        message: error instanceof Error ? error.message : "Unknown browser error",
      },
    };
  } finally {
    await browser.close();
  }
}
