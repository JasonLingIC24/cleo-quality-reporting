import { ManualRegressionRun } from "../../models/ManualRegressionRun";
import { TestRun } from "../../models/TestRun";

export interface HealthSummaryItem {
  area: string;

  status: "HEALTHY" | "MONITOR" | "FAILED" | "READY" | "COMPLETE";

  details: string;
}

export function buildHealthSummary(
  cypress: TestRun,
  backendUnit: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  },
  backendIntegration: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  },
  frontendCoverage: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  },
  manualRegression: ManualRegressionRun[],
): HealthSummaryItem[] {
  const items: HealthSummaryItem[] = [];

  //
  // Cypress
  //

  items.push({
    area: "Cypress",
    status: cypress.failed > 0 ? "FAILED" : "HEALTHY",
    details: `${cypress.failed} failures from ` + `${cypress.totalTests} tests`,
  });

  //
  // Backend Unit
  //

  items.push({
    area: "Backend Unit",
    status: backendUnit.failed > 0 ? "FAILED" : "HEALTHY",
    details: `${backendUnit.passed}/${backendUnit.total} passed`,
  });

  //
  // Backend Integration
  //

  items.push({
    area: "Backend Integration",
    status:
      backendIntegration.failed > 0
        ? "FAILED"
        : backendIntegration.skipped > 0
          ? "MONITOR"
          : "HEALTHY",
    details:
      `${backendIntegration.passed} passed, ` +
      `${backendIntegration.failed} failed, ` +
      `${backendIntegration.skipped} skipped`,
  });

  //
  // Manual Regression
  //

  const completeWorkbooks = manualRegression.filter(
    (workbook) => workbook.notRun === 0,
  ).length;

  const totalAssertions = manualRegression.reduce(
    (sum, workbook) => sum + workbook.assertionCount,
    0,
  );

  items.push({
    area: "Manual Regression",
    status:
      completeWorkbooks === manualRegression.length ? "COMPLETE" : "READY",
    details:
      `${manualRegression.length} workbooks, ` +
      `${totalAssertions} assertions`,
  });

  //
  // Frontend Coverage
  //

  items.push({
    area: "Frontend Coverage",
    status:
      frontendCoverage.lines >= 80
        ? "HEALTHY"
        : frontendCoverage.lines >= 70
          ? "MONITOR"
          : "FAILED",
    details:
      `Lines ${frontendCoverage.lines}% ` +
      `Branches ${frontendCoverage.branches}%`,
  });

  return items;
}
