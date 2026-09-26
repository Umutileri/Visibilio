import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { chromium } from "playwright";
import { runDetectionRules } from "./detectionRules";
import { assertSafeNavigationTarget } from "../api/urlSafety";
import { initialViewports } from "./viewports";
import type { ScanResult, ViewportPreset } from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_EVIDENCE_DIR = ".visibilio/evidence";
const issueNow = () => new Date().toISOString();

export interface ScanOptions {
  evidenceDir?: string;
  /**
   * Internal/test hook for navigation policy. Production callers should use
   * the default SSRF-safe policy.
   */
  navigationGuard?: (url: string) => Promise<void>;
}

function screenshotFileName(viewport: ViewportPreset): string {
  const safeName = viewport.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${safeName || "viewport"}.png`;
}

export async function scanPage(
  url: string,
  viewport: ViewportPreset = initialViewports[0],
  options: ScanOptions = {},
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
    const navigationGuard =
      options.navigationGuard ?? assertSafeNavigationTarget;

    await page.route("**/*", async (route) => {
      const request = route.request();
      if (request.isNavigationRequest()) {
        try {
          await navigationGuard(request.url());
        } catch {
          await route.abort("blockedbyclient");
          return;
        }
      }
      await route.continue();
    });

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: DEFAULT_TIMEOUT_MS,
      });

      const finalUrl = page.url();
      await navigationGuard(finalUrl);

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

      const evidenceDir = options.evidenceDir ?? DEFAULT_EVIDENCE_DIR;
      await mkdir(evidenceDir, { recursive: true });

      const screenshotPath = join(evidenceDir, screenshotFileName(viewport));
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: "png",
      });

      return {
        ok: true,
        url,
        viewport,
        dimensions,
        screenshot: {
          type: "screenshot",
          format: "png",
          path: screenshotPath,
          viewport,
          width: dimensions.viewportWidth,
          height: dimensions.viewportHeight,
          capturedAt: issueNow(),
        },
        issues,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown page error";
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
