import type { UIssue } from "../scanner/types";
import type { ScanSession } from "./sessionTypes";

export type FindingChange = "new" | "resolved" | "unchanged";

export interface FindingComparison {
  key: string;
  title: string;
  severity: UIssue["severity"];
  change: FindingChange;
  before?: UIssue;
  after?: UIssue;
}

function findingKey(finding: UIssue): string {
  return [
    finding.rule,
    finding.viewport.width,
    finding.viewport.height,
    finding.selector ?? "",
  ].join("|");
}

export interface ScanComparison {
  previousSessionId?: string;
  currentSessionId: string;
  newFindings: UIssue[];
  resolvedFindings: UIssue[];
  unchangedFindings: UIssue[];
}

export function compareScanSessions(
  current: ScanSession,
  previous?: ScanSession,
): ScanComparison {
  if (!previous) {
    return {
      currentSessionId: current.id,
      newFindings: current.findings,
      resolvedFindings: [],
      unchangedFindings: [],
    };
  }

  const previousByKey = new Map(
    previous.findings.map((finding) => [findingKey(finding), finding]),
  );
  const currentByKey = new Map(
    current.findings.map((finding) => [findingKey(finding), finding]),
  );

  const newFindings: UIssue[] = [];
  const unchangedFindings: UIssue[] = [];
  const resolvedFindings: UIssue[] = [];

  for (const [key, finding] of currentByKey) {
    if (previousByKey.has(key)) unchangedFindings.push(finding);
    else newFindings.push(finding);
  }

  for (const [key, finding] of previousByKey) {
    if (!currentByKey.has(key)) resolvedFindings.push(finding);
  }

  return {
    previousSessionId: previous.id,
    currentSessionId: current.id,
    newFindings,
    resolvedFindings,
    unchangedFindings,
  };
}
