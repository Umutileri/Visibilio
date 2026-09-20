import type { UIssue } from "../scanner/types";
import type { RetestComparison } from "./sessionTypes";

function findingKey(finding: UIssue): string {
  return [
    finding.rule,
    finding.selector ?? "",
    finding.viewport.width,
    finding.viewport.height,
  ].join("|");
}

export function compareFindingSets(
  previous: UIssue[],
  current: UIssue[],
): RetestComparison[] {
  const currentByKey = new Map(current.map((finding) => [findingKey(finding), finding]));

  return previous.map((before) => {
    const after = currentByKey.get(findingKey(before));

    if (!after) {
      return {
        previousFindingId: before.id,
        rule: before.rule,
        selector: before.selector,
        viewport: before.viewport,
        status: "resolved",
        previousMeasurements: before.measurements,
      };
    }

    const beforeMeasurements = before.measurements ?? {};
    const afterMeasurements = after.measurements ?? {};
    const measurementKeys = new Set([
      ...Object.keys(beforeMeasurements),
      ...Object.keys(afterMeasurements),
    ]);
    const sameMeasurement = [...measurementKeys].every(
      (key) => beforeMeasurements[key] === afterMeasurements[key],
    );

    return {
      previousFindingId: before.id,
      currentFindingId: after.id,
      rule: before.rule,
      selector: before.selector,
      viewport: before.viewport,
      status: sameMeasurement ? "still-open" : "changed",
      previousMeasurements: before.measurements,
      currentMeasurements: after.measurements,
    };
  });
}
