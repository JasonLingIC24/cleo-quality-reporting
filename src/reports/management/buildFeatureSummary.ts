import type { FailedTest } from "../../models";

export interface FeatureSummary {
  feature: string;
  count: number;
}

export function buildFeatureSummary(failures: FailedTest[]): FeatureSummary[] {
  const counts = new Map<string, number>();

  for (const failure of failures) {
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
