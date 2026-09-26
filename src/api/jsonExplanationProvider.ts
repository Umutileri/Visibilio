import type {
  ExplanationProvider,
  ExplanationRequest,
  FindingExplanation,
} from "./explanation";

export interface JsonExplanationProviderOptions {
  endpoint: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  fetchImpl?: typeof fetch;
}

type ProviderResponse = {
  findingId?: unknown;
  source?: unknown;
  summary?: unknown;
  technical?: unknown;
  context?: unknown;
  uncertainty?: unknown;
  generatedAt?: unknown;
};

function isExplanation(value: ProviderResponse): value is {
  findingId: string;
  source: "ai";
  summary: string;
  technical: string;
  context: string[];
  uncertainty?: string;
  generatedAt: string;
} {
  return (
    typeof value.findingId === "string" &&
    value.source === "ai" &&
    typeof value.summary === "string" &&
    typeof value.technical === "string" &&
    Array.isArray(value.context) &&
    value.context.every((item) => typeof item === "string") &&
    (value.uncertainty === undefined || typeof value.uncertainty === "string") &&
    typeof value.generatedAt === "string"
  );
}

function buildPayload(request: ExplanationRequest, model?: string) {
  return {
    model,
    finding: request.finding,
    evidence: request.evidence ?? [],
    instruction:
      "Explain the finding without changing or inventing measurements. Separate observed evidence from interpretation and state uncertainty when relevant.",
  };
}

export class JsonExplanationProvider implements ExplanationProvider {
  private readonly endpoint: string;
  private readonly apiKey?: string;
  private readonly model?: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: JsonExplanationProviderOptions) {
    this.endpoint = options.endpoint;
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs ?? 8_000;
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 2);
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async explain(
    request: ExplanationRequest,
  ): Promise<FindingExplanation> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchImpl(this.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(this.apiKey
              ? { authorization: "Bearer " + this.apiKey }
              : {}),
          },
          body: JSON.stringify(buildPayload(request, this.model)),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Explanation provider returned HTTP " + response.status);
        }

        const payload = (await response.json()) as ProviderResponse;
        if (!isExplanation(payload)) {
          throw new Error("Explanation provider returned an invalid response.");
        }

        return payload;
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Explanation provider request failed.");
  }
}
