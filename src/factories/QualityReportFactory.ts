import { CoverageSummary } from "../models/CoverageSummary";
import { ManualRegressionRun } from "../models/ManualRegressionRun";
import { QualityReport } from "../models/QualityReport";
import { TestRun } from "../models/TestRun";
import { TestSuiteRun } from "../models/TestSuiteRun";
import { ReleaseAssessmentFactory } from "./ReleaseAssessmentFactory";

export class QualityReportFactory {
  static create(
    cypress: TestRun,
    backendUnit: TestSuiteRun,
    backendIntegration: TestSuiteRun,
    frontendCoverage: CoverageSummary,
    manualRegression: ManualRegressionRun[] = [],
  ): QualityReport {
    const report: QualityReport = {
      executionDate: cypress.executionDate,

      cypress,

      backendUnit,

      backendIntegration,

      frontendCoverage,

      manualRegression,
    };
    report.assessment = ReleaseAssessmentFactory.create(report);

    return report;
  }
}
