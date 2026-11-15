import { QualityReport } from "../models/QualityReport";
import { ReleaseAssessment } from "../models/ReleaseAssessment";

import { buildReleaseRecommendation } from "../reports/management/buildReleaseRecommendation";

export class ReleaseAssessmentFactory {
  static create(report: QualityReport): ReleaseAssessment {
    const totalTests =
      report.cypress.totalTests +
      report.backendUnit.total +
      report.backendIntegration.total;

    const passed =
      report.cypress.passed +
      report.backendUnit.passed +
      report.backendIntegration.passed;

    const failed =
      report.cypress.failed +
      report.backendUnit.failed +
      report.backendIntegration.failed;

    const skipped =
      report.cypress.skipped +
      report.backendUnit.skipped +
      report.backendIntegration.skipped;

    const manualFailures =
      report.manualRegression?.reduce(
        (sum, workbook) => sum + workbook.failed,
        0,
      ) ?? 0;

    const manualNotExecuted =
      report.manualRegression?.reduce(
        (sum, workbook) => sum + workbook.notExecuted,
        0,
      ) ?? 0;

    return {
      totalTests,

      passed,

      failed,

      skipped,

      passRate: Number(((passed / totalTests) * 100).toFixed(2)),

      failureRate: Number(((failed / totalTests) * 100).toFixed(2)),

      manualFailures,

      manualNotExecuted,

      recommendation: buildReleaseRecommendation(report),
    };
  }
}
