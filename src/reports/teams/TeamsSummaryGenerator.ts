import * as fs from "node:fs";
import * as path from "node:path";

import { QualityReport } from "../../models/QualityReport";

import { buildCandidateDefects } from "../management/buildCandidateDefects";
import { buildFailureSummary } from "../management/buildFailureSummary";
import { buildFeatureSummary } from "../management/buildFeatureSummary";
import { buildReleaseRecommendation } from "../management/buildReleaseRecommendation";

export class TeamsSummaryGenerator {
  async generate(report: QualityReport): Promise<void> {
    const outputDir = "./reports/teams";

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const recommendation = {
      status: "Not Evaluated",
      rationale: [],
    };

    const cypress = report.cypress;

    const backendUnit = report.backendUnit;

    const backendIntegration = report.backendIntegration;

    const frontendCoverage = report.frontendCoverage;

    const categories = buildFailureSummary(cypress.failedTests);

    const features = buildFeatureSummary(cypress.failedTests);

    const defects = buildCandidateDefects(cypress.failedTests);

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

    lines.push(`Recommendation: ${recommendation.status}`);

    lines.push("");

    lines.push("Automated Quality");

    lines.push("");

    lines.push(
      `• Cypress: ${cypress.totalTests} tests (${cypress.failed} failed)`,
    );

    lines.push(
      `• Backend Unit: ${backendUnit.total} tests (${backendUnit.failed} failed)`,
    );

    lines.push(
      `• Backend Integration: ${backendIntegration.total} tests (${backendIntegration.failed} failed)`,
    );

    lines.push("");

    lines.push("Frontend Coverage");

    lines.push("");

    lines.push(`• Lines: ${frontendCoverage.lines}%`);

    lines.push(`• Branches: ${frontendCoverage.branches}%`);

    lines.push("");

    lines.push("Top Failure Categories:");

    lines.push("");

    for (const category of categories.slice(0, 3)) {
      lines.push(`• ${category.category} (${category.count})`);
    }

    lines.push("");

    lines.push("Top Impacted Features:");

    lines.push("");

    for (const feature of features.slice(0, 3)) {
      lines.push(`• ${feature.feature} (${feature.count})`);
    }

    lines.push("");

    lines.push("Key Issues:");

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

    console.log("Teams summary generated");
  }
}
