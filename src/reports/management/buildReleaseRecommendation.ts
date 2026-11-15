import { QualityReport } from "../../models/QualityReport";

import { buildCandidateDefects } from "./buildCandidateDefects";
import { buildFailureSummary } from "./buildFailureSummary";
import { buildFeatureSummary } from "./buildFeatureSummary";

export interface ReleaseRecommendation {
  status: string;
  rationale: string[];
}

export function buildReleaseRecommendation(
  report: QualityReport,
): ReleaseRecommendation {
  const rationale: string[] = [];

  const cypress = report.cypress;

  const backendUnit = report.backendUnit;

  const backendIntegration = report.backendIntegration;

  const totalTests =
    cypress.totalTests + backendUnit.total + backendIntegration.total;

  const totalFailures =
    cypress.failed + backendUnit.failed + backendIntegration.failed;

  const failureRate = (totalFailures / totalTests) * 100;

  const categories = buildFailureSummary(cypress.failedTests);

  const defects = buildCandidateDefects(cypress.failedTests);

  const features = buildFeatureSummary(cypress.failedTests);

  const topCategory = categories[0];

  const largestDefect = defects[0];

  //
  // Manual Regression
  //

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

  //
  // Rationale
  //

  rationale.push(
    `Overall automated failure rate is ${failureRate.toFixed(
      2,
    )}% (${totalFailures} failed tests)`,
  );

  if (cypress.failed > 0) {
    rationale.push(`${cypress.failed} Cypress failures detected`);
  }

  if (backendIntegration.failed > 0) {
    rationale.push(
      `${backendIntegration.failed} Backend Integration failures detected`,
    );
  }

  if (backendUnit.failed > 0) {
    rationale.push(`${backendUnit.failed} Backend Unit failures detected`);
  }

  const manualRuns = report.manualRegression ?? [];

  if (manualFailures > 0) {
    rationale.push(`${manualFailures} Manual Regression failures detected`);

    for (const run of manualRuns.filter((r) => r.failed > 0)) {
      rationale.push(
        `${run.featureId} (${run.featureName}) contains ${run.failed} failed assertions`,
      );
    }
  }

  if (manualNotExecuted > 0) {
    rationale.push(
      `${manualNotExecuted} Manual Regression assertions remain unexecuted`,
    );

    for (const run of manualRuns.filter((r) => r.notExecuted > 0)) {
      rationale.push(
        `${run.featureId} (${run.featureName}) has ${run.notExecuted} assertions awaiting execution`,
      );
    }
  }

  if (topCategory) {
    rationale.push(
      `Most common failure category is ${topCategory.category} (${topCategory.count} failures)`,
    );
  }

  if (largestDefect) {
    rationale.push(
      `${largestDefect.failureCount} tests affected by "${largestDefect.title}"`,
    );

    rationale.push(
      `${largestDefect.impactedFeatures.length} features impacted by this defect`,
    );
  }

  for (const feature of features.slice(0, 3)) {
    rationale.push(`${feature.feature} contains ${feature.count} failures`);
  }

  //
  // Release Decision
  //

  let status = "🟢 Release Approved";

  const criticalAutomationFailure =
    cypress.failed > 25 ||
    backendIntegration.failed > 0 ||
    (largestDefect?.failureCount ?? 0) >= 10;

  if (manualFailures > 0) {
    status = "🔴 Do Not Release";
  } else if (criticalAutomationFailure) {
    status = "🔴 Do Not Release";
  } else if (manualNotExecuted > 0) {
    status = "🟡 Release With Risk";
  } else if (failureRate > 5) {
    status = "🟡 Release With Risk";
  }
  return {
    status,
    rationale,
  };
}
