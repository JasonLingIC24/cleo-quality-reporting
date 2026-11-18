import { ManualRegressionFailure } from "./ManualRegressionFailure";

export interface ManualRegressionRun {
  workbookId: string;

  featureId: string;
  featureName: string;

  scenarioCount: number;
  assertionCount: number;

  passed: number;
  failed: number;

  notRun: number;
  notApplicable: number;

  passRate: number;

  manualTests: number;
  automatedTests: number;

  failures: ManualRegressionFailure[];
}
