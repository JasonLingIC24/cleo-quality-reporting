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

    const requiredWorkbookIds =
      report.releaseTestPlan?.manualWorkbooks
        .filter((workbook) => workbook.required)
        .map((workbook) => workbook.workbookId.toLowerCase()) ?? [];

    const requiredManualRuns = (report.manualRegression ?? []).filter(
      (workbook) =>
        requiredWorkbookIds.includes(workbook.workbookId.toLowerCase()),
    );

    const manualFailures =
      requiredManualRuns.reduce((sum, workbook) => sum + workbook.failed, 0) ??
      0;

    const manualNotRun =
      requiredManualRuns.reduce((sum, workbook) => sum + workbook.notRun, 0) ??
      0;

    const manualNotApplicable =
      requiredManualRuns.reduce(
        (sum, workbook) => sum + workbook.notApplicable,
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

      manualNotRun,

      manualNotApplicable,

      recommendation: buildReleaseRecommendation(report),
    };
  }
}
