import type { UIssue } from "../scanner/types";

export type ExplanationSource = "ai" | "fallback";

export interface FindingExplanation {
  findingId: string;
  source: ExplanationSource;
  summary: string;
  technical: string;
  context: string[];
  uncertainty?: string;
  generatedAt: string;
}

export interface ExplanationRequest {
  finding: UIssue;
  evidence: UIssue["evidence"];
}

export interface ExplanationProvider {
  explain(request: ExplanationRequest): Promise<FindingExplanation>;
}
