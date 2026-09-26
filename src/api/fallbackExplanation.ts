import type {
  ExplanationProvider,
  ExplanationRequest,
  FindingExplanation,
} from "./explanation";

function fallbackText(request: ExplanationRequest): FindingExplanation {
  const { finding } = request;
  const evidence = request.evidence ?? [];

  return {
    findingId: finding.id,
    source: "fallback",
    summary: finding.description,
    technical: evidence.length
      ? "The scanner measured " +
        evidence.map((item) => item.metric + "=" + item.value + item.unit).join(", ") +
        " for this finding."
      : "The scanner detected this rule at the reported viewport and selector.",
    context: [
      "Rule: " + finding.rule,
      "Viewport: " +
        finding.viewport.width +
        " × " +
        finding.viewport.height,
      ...(finding.selector ? ["Selector: " + finding.selector] : []),
    ],
    uncertainty:
      "This is deterministic scanner context, not a model-generated explanation.",
    generatedAt: new Date().toISOString(),
  };
}

export class FallbackExplanationProvider implements ExplanationProvider {
  async explain(request: ExplanationRequest): Promise<FindingExplanation> {
    return fallbackText(request);
  }
}
