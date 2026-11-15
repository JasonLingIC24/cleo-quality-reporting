import type { FailedTest } from "../../models";

export interface FailureCategory {
  category: string;
  count: number;
}

export function buildFailureSummary(failures: FailedTest[]): FailureCategory[] {
  const counts = new Map<string, number>();

  for (const failure of failures) {
    const current = counts.get(failure.rootCause) ?? 0;

    counts.set(failure.rootCause, current + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
