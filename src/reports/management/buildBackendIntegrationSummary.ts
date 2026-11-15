import { BackendIntegrationFailure } from "../../models/BackendIntegrationFailure";

export interface BackendIntegrationSummary {
  suite: string;

  count: number;

  rootCause: string;
}

export function buildBackendIntegrationSummary(
  failures: BackendIntegrationFailure[],
): BackendIntegrationSummary[] {
  const groups = new Map<string, BackendIntegrationSummary>();

  for (const failure of failures) {
    const existing = groups.get(failure.suite);

    if (existing) {
      existing.count++;

      continue;
    }

    groups.set(failure.suite, {
      suite: failure.suite,

      count: 1,

      rootCause: failure.rootCause,
    });
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}
