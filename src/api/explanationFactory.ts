import { FallbackExplanationProvider } from "./fallbackExplanation";
import type { ExplanationProvider } from "./explanation";
import {
  JsonExplanationProvider,
  type JsonExplanationProviderOptions,
} from "./jsonExplanationProvider";

export function createExplanationProvider(
  env: NodeJS.ProcessEnv = process.env,
): ExplanationProvider {
  const endpoint = env.VISIBILIO_EXPLANATION_ENDPOINT?.trim();

  if (!endpoint) {
    return new FallbackExplanationProvider();
  }

  const options: JsonExplanationProviderOptions = {
    endpoint,
    apiKey: env.VISIBILIO_EXPLANATION_API_KEY,
    model: env.VISIBILIO_EXPLANATION_MODEL,
    timeoutMs: env.VISIBILIO_EXPLANATION_TIMEOUT_MS
      ? Number(env.VISIBILIO_EXPLANATION_TIMEOUT_MS)
      : undefined,
    maxAttempts: env.VISIBILIO_EXPLANATION_MAX_ATTEMPTS
      ? Number(env.VISIBILIO_EXPLANATION_MAX_ATTEMPTS)
      : undefined,
  };

  return new JsonExplanationProvider(options);
}
