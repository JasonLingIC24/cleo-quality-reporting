import * as fs from "node:fs";
import * as path from "node:path";

import { QualityReport } from "../../models/QualityReport";

import { buildFeatureSummary } from "./buildFeatureSummary";
import { buildExecutiveSummary } from "./buildExecutiveSummary";
import { buildCandidateDefects } from "./buildCandidateDefects";
import { buildBackendIntegrationSummary } from "./buildBackendIntegrationSummary";

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

    const featureSummary = buildFeatureSummary(cypress.failedTests);

    const executiveSummary = buildExecutiveSummary(cypress.failedTests);

    const releaseRecommendation = assessment.recommendation;

    const candidateDefects = buildCandidateDefects(cypress.failedTests);

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

    //
    // Release Recommendation
    //

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
    // Release Test Plan
    //

    if (report.releaseTestPlan) {
      lines.push("## Release Test Plan");

      lines.push("");

      lines.push(`Release Version: ${report.releaseTestPlan.releaseVersion}`);

      lines.push("");

      lines.push(`GitHub Run ID: ${report.releaseTestPlan.githubRunId}`);

      lines.push("");

      lines.push(
        `Planned Manual Workbooks: ${report.releaseTestPlan.manualWorkbooks.length}`,
      );

      lines.push("");

      lines.push("| Workbook | Owner | Status |");

      lines.push("|----------|-------|--------|");

      for (const workbook of report.workbookStatuses ?? []) {
        const status =
          workbook.status === "COMPLETE"
            ? "✅ Complete"
            : workbook.status === "IN_PROGRESS"
              ? "🟡 In Progress"
              : workbook.status === "READY"
                ? "🔵 Ready"
                : "⚪ Not Started";

        lines.push(
          `| ${workbook.workbookId} | ${workbook.owner ?? "Unassigned"} | ${status} |`,
        );
      }

      lines.push("");
    }

    //
    // Test Plan Progress
    //

    if (report.testPlanProgress) {
      const progress = report.testPlanProgress;

      lines.push("### Test Plan Progress");

      lines.push("");

      lines.push(`- Planned Workbooks: ${progress.plannedWorkbooks}`);

      lines.push(`- Complete: ${progress.completeWorkbooks}`);

      lines.push(`- Ready: ${progress.readyWorkbooks}`);

      lines.push(`- In Progress: ${progress.inProgressWorkbooks}`);

      lines.push(`- Not Started: ${progress.notStartedWorkbooks}`);

      lines.push(`- Completion: ${progress.completionPercentage}%`);

      lines.push("");

      let status = "⚪ Not Started";

      if (progress.completeWorkbooks === progress.plannedWorkbooks) {
        status = "✅ Complete";
      } else if (progress.inProgressWorkbooks > 0) {
        status = "🟡 In Progress";
      } else if (progress.readyWorkbooks > 0) {
        status = "🔵 Ready";
      } else if (progress.notStartedWorkbooks > 0) {
        status = "⚪ Not Started";
      }

      lines.push(`Overall Status: ${status}`);

      lines.push("");
    }

    lines.push("");

    //
    // Owner Progress
    //

    if (report.ownerProgress?.length) {
      lines.push("### Owner Progress");

      lines.push("");

      lines.push("| Owner | Complete | Ready | In Progress | Not Started |");

      lines.push("|-------|---------:|------:|------------:|------------:|");

      for (const owner of report.ownerProgress) {
        lines.push(
          `| ${owner.owner} | ${owner.complete} | ${owner.ready} | ${owner.inProgress} | ${owner.notStarted} |`,
        );
      }

      lines.push("");
    }

    //
    // Most Impacted Features
    //

    lines.push("## Most Impacted Features");

    lines.push("");

    lines.push("| Feature | Count |");

    lines.push("|---------|------:|");

    const topFeatures = featureSummary.slice(0, 10);

    for (const feature of topFeatures) {
      lines.push(`| ${feature.feature} | ${feature.count} |`);
    }

    lines.push("");

    lines.push(`*Showing ${topFeatures.length} most impacted features*`);

    lines.push("");

    //
    // Quality Metrics
    //

    lines.push("## Quality Metrics");

    lines.push("");

    lines.push("### Automated Quality");

    lines.push("");

    lines.push("| Suite | Total | Passed | Failed | Skipped |");

    lines.push("|-------|------:|-------:|-------:|--------:|");

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

    //
    // Backend Integration Failures
    //

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

    //
    // Manual Regression
    //

    if (report.manualRegression && report.manualRegression.length > 0) {
      lines.push("## Manual Regression");

      lines.push("");

      lines.push(
        "| Feature | ID | Scenarios | Assertions | Pass | Fail | Not Run | N/A |",
      );

      lines.push(
        "|---------|----|----------:|-----------:|-----:|-----:|--------:|----:|",
      );

      for (const workbook of report.manualRegression) {
        lines.push(
          `| ${workbook.featureName} | ${workbook.featureId} | ${workbook.scenarioCount} | ${workbook.assertionCount} | ${workbook.passed} | ${workbook.failed} | ${workbook.notRun} | ${workbook.notApplicable} |`,
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

      const totalNotRun = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.notRun,
        0,
      );

      const totalNotApplicable = report.manualRegression.reduce(
        (sum, workbook) => sum + workbook.notApplicable,
        0,
      );

      lines.push("### Manual Regression Summary");

      lines.push("");

      lines.push(`- Workbook Count: ${report.manualRegression.length}`);

      lines.push(`- Total Assertions: ${totalAssertions}`);

      lines.push(`- Passed: ${totalPassed}`);

      lines.push(`- Failed: ${totalFailed}`);

      lines.push(`- Not Run: ${totalNotRun}`);

      lines.push(`- N/A: ${totalNotApplicable}`);

      if (totalFailed > 0) {
        lines.push("- Status: 🔴 Manual Failures Present");
      } else if (totalNotRun > 0) {
        lines.push("- Status: 🟡 Execution Incomplete");
      } else {
        lines.push("- Status: ✅ Complete");
      }

      lines.push("");
    }

    //
    // Manual Regression Issues
    //

    const workbooksWithFailures = (report.manualRegression ?? []).filter(
      (workbook) => workbook.failures.length > 0,
    );

    if (workbooksWithFailures.length > 0) {
      const totalManualFailures = workbooksWithFailures.reduce(
        (sum, workbook) => sum + workbook.failures.length,
        0,
      );

      lines.push("## Manual Regression Issues");

      lines.push("");

      lines.push(`Total Failed Assertions: ${totalManualFailures}`);

      lines.push("");

      for (const workbook of workbooksWithFailures) {
        lines.push(`### ${workbook.featureName} (${workbook.featureId})`);

        lines.push("");

        lines.push(`Failed Assertions: ${workbook.failures.length}`);

        lines.push("");

        for (const failure of workbook.failures) {
          lines.push(`#### ${failure.testCaseId} ${failure.scenario}`);

          lines.push("");

          lines.push("Expected Result");

          lines.push("");

          lines.push(
            `- ${this.cleanExpectedResult(failure.then || "Not provided")}`,
          );

          lines.push("");

          if (failure.notes) {
            lines.push("Notes");

            lines.push("");

            lines.push(`- ${failure.notes}`);

            lines.push("");
          }

          if (failure.evidence) {
            lines.push("Evidence");

            lines.push("");

            lines.push(`- ${failure.evidence}`);

            lines.push("");
          }
        }
      }
    }

    //
    // Frontend Coverage
    //

    lines.push("## Frontend Coverage");

    lines.push("");

    lines.push("| Metric | Coverage |");

    lines.push("|--------|---------:|");

    lines.push(`| Lines | ${frontendCoverage.lines}% |`);

    lines.push(`| Statements | ${frontendCoverage.statements}% |`);

    lines.push(`| Functions | ${frontendCoverage.functions}% |`);

    lines.push(`| Branches | ${frontendCoverage.branches}% |`);

    lines.push("");

    //
    // Key Issues
    //

    lines.push("## Key Issues");

    lines.push("");

    const manualKeyIssues = this.buildManualRegressionKeyIssues(report);

    lines.push(...manualKeyIssues);

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

  private cleanExpectedResult(value: string): string {
    return value.replace(/^(THEN|AND)\s+/i, "");
  }

  private buildManualRegressionKeyIssues(report: QualityReport): string[] {
    const lines: string[] = [];

    const failedWorkbooks = (report.manualRegression ?? []).filter(
      (workbook) => workbook.failed > 0,
    );

    for (const workbook of failedWorkbooks) {
      lines.push(`### ${workbook.featureName} (${workbook.featureId})`);

      lines.push("");

      lines.push("- Category: Manual Regression");

      lines.push(`- Failed Assertions: ${workbook.failed}`);

      lines.push("");

      lines.push(
        "See Manual Regression Issues for failed test details, notes and supporting evidence.",
      );

      lines.push("");

      lines.push("---");

      lines.push("");
    }

    return lines;
  }
}
