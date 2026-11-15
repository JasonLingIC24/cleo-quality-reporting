import { ManualRegressionFailure } from "./ManualRegressionFailure";

export interface ManualRegressionRun {
  featureId: string;

  featureName: string;

  scenarioCount: number;

  assertionCount: number;

  passed: number;

  failed: number;

  notExecuted: number;

  passRate: number;

  manualTests: number;

  automatedTests: number;

  failures: ManualRegressionFailure[];
}
