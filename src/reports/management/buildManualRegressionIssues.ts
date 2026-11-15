import { ManualRegressionRun } from "../../models/ManualRegressionRun";

export interface ManualRegressionIssue {
  featureId: string;

  featureName: string;

  failedAssertions: number;
}

export function buildManualRegressionIssues(
  runs: ManualRegressionRun[],
): ManualRegressionIssue[] {
  return runs
    .filter((run) => run.failed > 0)
    .map((run) => ({
      featureId: run.featureId,

      featureName: run.featureName,

      failedAssertions: run.failed,
    }))
    .sort((a, b) => b.failedAssertions - a.failedAssertions);
}
