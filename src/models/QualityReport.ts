import { TestRun } from "./TestRun";
import { TestSuiteRun } from "./TestSuiteRun";
import { CoverageSummary } from "./CoverageSummary";
import { ReleaseAssessment } from "./ReleaseAssessment";
import { ManualRegressionRun } from "./ManualRegressionRun";

export interface QualityReport {
  executionDate: string;

  cypress: TestRun;

  backendUnit: TestSuiteRun;

  backendIntegration: TestSuiteRun;

  frontendCoverage: CoverageSummary;

  manualRegression?: ManualRegressionRun[];

  assessment?: ReleaseAssessment;
}
