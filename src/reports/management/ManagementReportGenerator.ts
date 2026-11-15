import * as fs from "node:fs";
import * as path from "node:path";
import { QualityReport } from "../../models/QualityReport";
import { buildFailureSummary } from "./buildFailureSummary";
import { buildFeatureSummary } from "./buildFeatureSummary";
import { buildExecutiveSummary } from "./buildExecutiveSummary";
import { buildCandidateDefects } from "./buildCandidateDefects";
import { buildBackendIntegrationSummary } from "./buildBackendIntegrationSummary";
import { buildManualRegressionIssues } from "./buildManualRegressionIssues";

export class ManagementReportGenerator {
  async generate(
    report: QualityReport,
    reportDate: Date = new Date(),
  ): Promise<void> {
    const outputDir = "./reports/management";

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const cypress = report.cypress;
    const backendUnit = report.backendUnit;
    const backendIntegration = report.backendIntegration;
    const frontendCoverage = report.frontendCoverage;

    const assessment = report.assessment!;

    const failureSummary = buildFailureSummary(cypress.failedTests);

    const featureSummary = buildFeatureSummary(cypress.failedTests);

    const executiveSummary = buildExecutiveSummary(cypress.failedTests);

    const releaseRecommendation = assessment.recommendation;

    const candidateDefects = buildCandidateDefects(cypress.failedTests);

    const manualIssues = buildManualRegressionIssues(
      report.manualRegression ?? [],
    );

    const lines: string[] = [];

    //
    // Header
    //

    lines.push("# Nightly Regression Report");

    lines.push("");
    lines.push(`Report Generated: ${this.formatDate(reportDate)} UTC`);

    lines.push("");

    lines.push(`Test Execution: ${report.executionDate}`);

    lines.push("");

    //
    // Executive Summary
    //

    lines.push("## Executive Summary");

    lines.push("");

    lines.push(`- Overall Risk: ${executiveSummary.overallRisk}`);

    lines.push(`- Critical Features: ${executiveSummary.criticalFeatures}`);

    lines.push(`- High Risk Features: ${executiveSummary.highRiskFeatures}`);

    lines.push(
      `- Medium Risk Features: ${executiveSummary.mediumRiskFeatures}`,
    );

    lines.push(`- Low Risk Features: ${executiveSummary.lowRiskFeatures}`);

    lines.push(
      `- Most Common Failure: ${executiveSummary.mostCommonFailure} (${executiveSummary.mostCommonFailureCount})`,
    );

    lines.push(`- Top Impact Feature: ${executiveSummary.topImpactFeature}`);

    lines.push("");

    lines.push("## Release Recommendation");

    lines.push("");

    lines.push(releaseRecommendation.status);

    lines.push("");

    lines.push("Reasons:");

    lines.push("");

    for (const reason of releaseRecommendation.rationale) {
      lines.push(`- ${reason}`);
    }

    lines.push("");

    //
    // Test Summary
    //

    lines.push("## Summary");

    lines.push("");

    lines.push("### Automated Quality");

    lines.push("");

    lines.push("| Suite | Total | Passed | Failed | Skipped |");
    lines.push("|-------|-------|--------|--------|---------|");

    lines.push(
      `| Cypress | ${cypress.totalTests} | ${cypress.passed} | ${cypress.failed} | ${cypress.skipped} |`,
    );

    lines.push(
      `| Backend Unit | ${backendUnit.total} | ${backendUnit.passed} | ${backendUnit.failed} | ${backendUnit.skipped} |`,
    );

    lines.push(
      `| Backend Integration | ${backendIntegration.total} | ${backendIntegration.passed} | ${backendIntegration.failed} | ${backendIntegration.skipped} |`,
    );

    lines.push("");

    lines.push(`- Total Tests: ${assessment.totalTests}`);

    lines.push(`- Passed: ${assessment.passed}`);

    lines.push(`- Failed: ${assessment.failed}`);

    lines.push(`- Skipped: ${assessment.skipped}`);

    lines.push(`- Pass Rate: ${assessment.passRate}%`);

    lines.push(`- Failure Rate: ${assessment.failureRate}%`);

    lines.push("");

    lines.push("## Frontend Coverage");

    lines.push("");

    lines.push("| Metric | Coverage |");
    lines.push("|--------|----------|");

    lines.push(`| Lines | ${frontendCoverage.lines}% |`);

    lines.push(`| Statements | ${frontendCoverage.statements}% |`);

    lines.push(`| Functions | ${frontendCoverage.functions}% |`);

    lines.push(`| Branches | ${frontendCoverage.branches}% |`);

    lines.push("");

    if (backendIntegration.failures?.length) {
      const backendSummary = buildBackendIntegrationSummary(
        backendIntegration.failures,
      );

      lines.push("## Backend Integration Failures");

      lines.push("");

      for (const issue of backendSummary) {
        lines.push(`- ${issue.suite}: ${issue.count} failures`);

        lines.push(`  - Root Cause: ${issue.rootCause}`);
      }

      lines.push("");
    }

    if (report.manualRegression && report.manualRegression.length > 0) {
      lines.push("## Manual Regression");

      lines.push("");

      lines.push("| Feature | Scenarios | Assertions | Pass | Fail | N/A |");

      lines.push("|---------|-----------|------------|------|------|-----|");

      for (const workbook of report.manualRegression) {
        lines.push(
          `| ${workbook.featureId} | ${workbook.scenarioCount} | ${workbook.assertionCount} | ${workbook.passed} | ${workbook.failed} | ${workbook.notExecuted} |`,
        );
      }

      lines.push("");

      const totalAssertions = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.assertionCount,
        0,
      );

      const totalPassed = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.passed,
        0,
      );

      const totalFailed = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.failed,
        0,
      );

      const totalNotExecuted = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.notExecuted,
        0,
      );

      lines.push("### Manual Regression Summary");

      lines.push("");

      lines.push(`- Workbook Count: ${report.manualRegression.length}`);

      lines.push(`- Total Assertions: ${totalAssertions}`);

      lines.push(`- Passed: ${totalPassed}`);

      lines.push(`- Failed: ${totalFailed}`);

      lines.push(`- Not Executed: ${totalNotExecuted}`);

      lines.push("");
    }

    for (const workbook of report.manualRegression ?? []) {
      if (workbook.failures.length === 0) {
        continue;
      }

      lines.push(`### ${workbook.featureId} Failures`);

      lines.push("");

      for (const failure of workbook.failures) {
        lines.push(`- ${failure.testCaseId}`);

        lines.push(`  - ${failure.scenario}`);
      }

      lines.push("");
    }

    //
    // Failure Categories
    //

    lines.push("## Failure Categories");

    lines.push("");

    lines.push("| Category | Count |");

    lines.push("|----------|-------|");
    const majorCategories = failureSummary.filter(
      (category) => category.count > 5,
    );

    const minorCategories = failureSummary.filter(
      (category) => category.count <= 5,
    );

    for (const category of majorCategories) {
      lines.push(`| ${category.category} | ${category.count} |`);
    }

    lines.push("");

    lines.push(`*Showing categories with more than 5 failures*`);

    lines.push("");

    if (minorCategories.length > 0) {
      lines.push("Other categories:");

      lines.push("");

      for (const category of minorCategories) {
        lines.push(`- ${category.category} (${category.count})`);
      }
    }

    lines.push("");

    //
    // Top Impacted Features
    //

    lines.push("## Top Impacted Features");

    lines.push("");

    lines.push("| Feature | Count |");

    lines.push("|---------|-------|");

    const topFeatures = featureSummary.slice(0, 10);

    for (const feature of topFeatures) {
      lines.push(`| ${feature.feature} | ${feature.count} |`);
    }
    lines.push("");

    lines.push(`*Showing top ${topFeatures.length} impacted features*`);

    lines.push("");

    //
    // Key Issues
    //

    lines.push("## Key Issues");

    lines.push("");

    for (const defect of candidateDefects.slice(0, 10)) {
      lines.push(`### ${defect.title}`);

      lines.push("");

      lines.push(`- Priority: ${defect.priority}`);

      lines.push(`- Affected Tests: ${defect.failureCount}`);

      lines.push(`- Affected Features: ${defect.impactedFeatures.length}`);

      lines.push(`- Root Cause: ${defect.rootCause}`);

      lines.push("");

      lines.push("**Impacted Features**");

      lines.push("");

      const topFeatures = defect.impactedFeatures.slice(0, 10);

      for (const feature of topFeatures) {
        lines.push(`- ${feature}`);
      }

      const remaining = defect.impactedFeatures.length - topFeatures.length;

      if (remaining > 0) {
        lines.push(`- +${remaining} more`);
      }

      lines.push("");

      lines.push("**Example Tests**");

      lines.push("");

      for (const test of defect.impactedTests.slice(0, 5)) {
        lines.push(`- ${test}`);
      }

      lines.push("");

      lines.push("---");

      lines.push("");
    }

    if (manualIssues.length > 0) {
      lines.push("");

      lines.push("### Manual Regression Issues");

      lines.push("");

      for (const issue of manualIssues) {
        lines.push(`- ${issue.featureId}`);

        lines.push(`  - Feature: ${issue.featureName}`);

        lines.push(`  - Failed Assertions: ${issue.failedAssertions}`);
      }

      lines.push("");
    }

    lines.push("Generated by cleo-quality-reporting v1.0.0");

    fs.writeFileSync(
      path.join(outputDir, "regression-summary.md"),
      lines.join("\n"),
      "utf8",
    );

    console.log("Management report generated");
  }

  private formatDate(date: Date): string {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }
}
