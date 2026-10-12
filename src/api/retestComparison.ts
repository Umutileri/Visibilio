import type { ScanResult, UIssue } from "../scanner/types";

export type RetestOutcome = "resolved" | "still-present" | "inconclusive";

export interface RetestComparison {
  before: UIssue;
  after?: UIssue;
  outcome: RetestOutcome;
}

export function findRetestMatch(
  original: UIssue,
  results: ScanResult[],
): UIssue | undefined {
  for (const result of results) {
    if (!result.ok) continue;
    const exact = result.issues.find(
      (finding) =>
        finding.rule === original.rule &&
        finding.viewport.width === original.viewport.width &&
        finding.viewport.height === original.viewport.height &&
        finding.selector === original.selector,
    );
    if (exact) return exact;
  }

  return undefined;
}

export function buildRetestComparison(
  original: UIssue,
  results: ScanResult[],
): RetestComparison {
  const successfulResults = results.filter((result) => result.ok);
  if (successfulResults.length !== results.length) {
    return { before: original, outcome: "inconclusive" };
  }

  const after = findRetestMatch(original, successfulResults);
  if (!after) return { before: original, outcome: "resolved" };
  return { before: original, after, outcome: "still-present" };
}
