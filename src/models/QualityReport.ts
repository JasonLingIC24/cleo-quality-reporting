import { TestRun } from "./TestRun";
import { TestSuiteRun } from "./TestSuiteRun";
import { CoverageSummary } from "./CoverageSummary";
import { ReleaseAssessment } from "./ReleaseAssessment";
import { ManualRegressionRun } from "./ManualRegressionRun";
import { ReleaseTestPlan } from "./ReleaseTestPlan";
import { TestPlanProgress } from "./TestPlanProgress";

export interface QualityReport {
  executionDate: string;

  cypress: TestRun;

  backendUnit: TestSuiteRun;

  backendIntegration: TestSuiteRun;

  frontendCoverage: CoverageSummary;

  manualRegression: ManualRegressionRun[];

  releaseTestPlan?: ReleaseTestPlan;

  assessment?: ReleaseAssessment;

  testPlanProgress?: TestPlanProgress;
}
