import type { FailedTest } from "../../models";

export interface RootCauseFeatureSummary {
  feature: string;
  count: number;
}

export function buildRootCauseFeatureSummary(
  failures: FailedTest[],
): RootCauseFeatureSummary[] {
  const counts = new Map<string, number>();

  const rootCauseFailures = failures;

  for (const failure of rootCauseFailures) {
    const feature = failure.feature || "Unknown";

    const current = counts.get(feature) ?? 0;

    counts.set(feature, current + 1);
  }

  return Array.from(counts.entries())
    .map(([feature, count]) => ({
      feature,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
