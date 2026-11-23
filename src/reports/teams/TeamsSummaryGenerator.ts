import * as fs from "node:fs";
import * as path from "node:path";

import { QualityReport } from "../../models/QualityReport";

import { buildCandidateDefects } from "../management/buildCandidateDefects";
import { buildFailureSummary } from "../management/buildFailureSummary";
import { buildFeatureSummary } from "../management/buildFeatureSummary";

export class TeamsSummaryGenerator {
  async generate(report: QualityReport): Promise<void> {
    const outputDir = "./reports/teams";

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const cypress = report.cypress;

    const backendUnit = report.backendUnit;

    const backendIntegration = report.backendIntegration;

    const frontendCoverage = report.frontendCoverage;

    const categories = buildFailureSummary(cypress.failedTests);

    const features = buildFeatureSummary(cypress.failedTests);

    const defects = buildCandidateDefects(cypress.failedTests);

    const topCategory = categories[0];

    const topFeature = features[0];

    const failingSpecs = new Set(
      cypress.failedTests.map((failure) => failure.specFile),
    ).size;

    const topSpec = [...cypress.failedTests]
      .reduce((grouped, failure) => {
        grouped.set(failure.specFile, (grouped.get(failure.specFile) ?? 0) + 1);

        return grouped;
      }, new Map<string, number>())
      .entries();

    const topSpecRow = [...topSpec].sort((a, b) => b[1] - a[1])[0];

    const lines: string[] = [];

    const executionDate = new Date(report.executionDate).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      },
    );

    lines.push("🔔 NIGHTLY REGRESSION REPORT");

    lines.push("");

    lines.push(`Execution: ${executionDate}`);

    lines.push("");

    //
    // Nightly Health
    //

    const backendUnitStatus = this.backendUnitStatus(
      backendUnit.total,
      backendUnit.failed,
    );

    const backendIntegrationStatus = this.backendIntegrationStatus(
      backendIntegration.total,
      backendIntegration.failed,
      backendIntegration.skipped,
    );

    const frontendCoverageStatus = this.frontendCoverageStatus(
      frontendCoverage.lines,
    );

    lines.push("Nightly Health");

    lines.push("");

    lines.push(
      `🔴 Cypress: ${cypress.failed} failures from ${cypress.totalTests} tests`,
    );

    lines.push(
      `${this.healthStatus(backendUnitStatus)} Backend Unit: ${
        backendUnit.total === 0
          ? "Summary unavailable"
          : `${backendUnit.passed}/${backendUnit.total} passed`
      }`,
    );

    lines.push(
      `${this.healthStatus(backendIntegrationStatus)} Backend Integration: ${
        backendIntegration.total === 0
          ? "Summary unavailable"
          : `${backendIntegration.passed} passed, ${backendIntegration.skipped} skipped`
      }`,
    );

    lines.push(
      `${this.healthStatus(frontendCoverageStatus)} Frontend Coverage: ${frontendCoverage.lines}% line coverage`,
    );

    lines.push("");

    //
    // Executive Summary
    //

    lines.push("Executive Summary");

    lines.push("");

    lines.push(`Failed Tests: ${cypress.failed}`);

    lines.push("");

    lines.push(`Failing Specs: ${failingSpecs}`);

    lines.push("");

    if (topCategory) {
      lines.push(
        `Top Failure Category: ${topCategory.category} (${topCategory.count} failures)`,
      );

      lines.push("");
    }

    if (topFeature) {
      lines.push(
        `Top Impacted Feature: ${topFeature.feature} (${topFeature.count} failures)`,
      );

      lines.push("");
    }

    if (topSpecRow) {
      lines.push(
        `Top Failing Spec: ${
          topSpecRow[0].split("/").pop()?.replace(".spec.ts", ".md") ??
          topSpecRow[0]
        } (${topSpecRow[1]} failures)`,
      );

      lines.push("");
    }

    //
    // Key Issues
    //

    lines.push("Key Issues");

    lines.push("");

    for (const defect of defects.slice(0, 3)) {
      lines.push(`• ${defect.title} (${defect.failureCount} tests)`);
    }

    lines.push("");

    lines.push("See Confluence for the full report.");

    fs.writeFileSync(
      path.join(outputDir, "nightly-regression-summary.md"),
      lines.join("\n"),
      "utf8",
    );
  }

  private healthStatus(status: string): string {
    switch (status) {
      case "HEALTHY":
        return "✅";

      case "MONITOR":
        return "⚠️";

      case "LOW":
        return "⚠️";

      case "UNAVAILABLE":
        return "⚪";

      case "FAILED":
        return "🔴";

      default:
        return "⚪";
    }
  }

  private backendUnitStatus(total: number, failed: number): string {
    if (total === 0) {
      return "UNAVAILABLE";
    }

    return failed > 0 ? "FAILED" : "HEALTHY";
  }

  private backendIntegrationStatus(
    total: number,
    failed: number,
    skipped: number,
  ): string {
    if (total === 0) {
      return "UNAVAILABLE";
    }

    if (failed > 0) {
      return "FAILED";
    }

    if (skipped > 0) {
      return "MONITOR";
    }

    return "HEALTHY";
  }

  private frontendCoverageStatus(lines: number): string {
    if (lines >= 80) {
      return "HEALTHY";
    }

    if (lines >= 70) {
      return "MONITOR";
    }

    return "LOW";
  }
}
