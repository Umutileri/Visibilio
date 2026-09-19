import { chromium } from "playwright";
import { runDetectionRules } from "./detectionRules";
import { initialViewports } from "./viewports";
import type { ScanResult, ViewportPreset } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;
const issueNow = () => new Date().toISOString();

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
      const issues = await runDetectionRules({
        page,
        url,
        viewport,
        detectedAt,
      });

      return {
        ok: true,
        url,
        viewport,
        dimensions,
        issues,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown page error";
      const isTimeout = /timeout/i.test(message);

      return {
        ok: false,
        url,
        viewport,
        error: {
          code: isTimeout ? "TIMEOUT" : "PAGE_ERROR",
          message,
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
        message:
          error instanceof Error ? error.message : "Unknown browser error",
      },
    };
  } finally {
    await browser.close();
  }
}
