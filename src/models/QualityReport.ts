import { TestRun } from "./TestRun";
import { TestSuiteRun } from "./TestSuiteRun";
import { CoverageSummary } from "./CoverageSummary";
import { ReleaseAssessment } from "./ReleaseAssessment";
import { ManualRegressionRun } from "./ManualRegressionRun";
import { ReleaseTestPlan } from "./ReleaseTestPlan";
import { TestPlanProgress } from "./TestPlanProgress";
import { WorkbookStatus } from "./WorkbookStatus";
import { OwnerProgress } from "./OwnerProgress";

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

  workbookStatuses?: WorkbookStatus[];

  ownerProgress?: OwnerProgress[];
}
