import { CoverageSummary } from "../models/CoverageSummary";
import { ManualRegressionRun } from "../models/ManualRegressionRun";
import { QualityReport } from "../models/QualityReport";
import { TestRun } from "../models/TestRun";
import { TestSuiteRun } from "../models/TestSuiteRun";
import { ReleaseAssessmentFactory } from "./ReleaseAssessmentFactory";
import { ReleaseTestPlan } from "../models/ReleaseTestPlan";
import { TestPlanProgress } from "../models/TestPlanProgress";
import { WorkbookStatus } from "../models/WorkbookStatus";
import { OwnerProgress } from "../models/OwnerProgress";

export class QualityReportFactory {
  static create(
    cypress: TestRun,
    backendUnit: TestSuiteRun,
    backendIntegration: TestSuiteRun,
    frontendCoverage: CoverageSummary,
    manualRegression: ManualRegressionRun[] = [],
    releaseTestPlan?: ReleaseTestPlan,
    testPlanProgress?: TestPlanProgress,
    workbookStatuses?: WorkbookStatus[],
    ownerProgress?: OwnerProgress[],
  ): QualityReport {
    const report: QualityReport = {
      executionDate: cypress.executionDate,

      cypress,

      backendUnit,

      backendIntegration,

      frontendCoverage,

      manualRegression,

      releaseTestPlan,

      testPlanProgress,

      workbookStatuses,

      ownerProgress,
    };
    report.assessment = ReleaseAssessmentFactory.create(report);

    return report;
  }
}
