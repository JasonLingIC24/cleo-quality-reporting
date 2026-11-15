import * as fs from "node:fs";
import * as path from "node:path";

import { TestRun } from "../../models";

import { buildCandidateDefects } from "../management/buildCandidateDefects";
import { buildFailureSummary } from "../management/buildFailureSummary";
import { buildFeatureSummary } from "../management/buildFeatureSummary";
import { buildExecutiveSummary } from "../management/buildExecutiveSummary";
import { buildReleaseRecommendation } from "../management/buildReleaseRecommendation";

export class ConfluenceReportGenerator {
  async generate(
    report: TestRun,
    reportDate: Date = new Date(),
  ): Promise<void> {
    const outputDir = "./reports/confluence";

    fs.mkdirSync(outputDir, {
      recursive: true,
    });

    const executiveSummary = buildExecutiveSummary(report.failedTests);

    const releaseRecommendation = {
      status: "Not Evaluated",
      rationale: [],
    };

    const categories = buildFailureSummary(report.failedTests);

    const features = buildFeatureSummary(report.failedTests);

    const defects = buildCandidateDefects(report.failedTests);

    const lines: string[] = [];

    lines.push("# Nightly Regression Report");

    lines.push("");

    lines.push(`Generated: ${reportDate.toISOString()}`);

    lines.push("");

    const passRate = ((report.passed / report.totalTests) * 100).toFixed(2);

    lines.push("## Executive Summary");

    lines.push("");

    lines.push(`- Overall Risk: ${executiveSummary.overallRisk}`);

    lines.push(`- Total Tests: ${report.totalTests}`);

    lines.push(`- Failed Tests: ${report.failed}`);

    lines.push(`- Pass Rate: ${passRate}%`);

    lines.push(`- Top Impact Feature: ${executiveSummary.topImpactFeature}`);

    lines.push(
      `- Most Common Failure: ${executiveSummary.mostCommonFailure} (${executiveSummary.mostCommonFailureCount})`,
    );

    lines.push("");

    lines.push("## Release Recommendation");

    lines.push("");

    lines.push(releaseRecommendation.status);

    lines.push("");

    for (const reason of releaseRecommendation.rationale) {
      lines.push(`- ${reason}`);
    }

    lines.push("");

    lines.push("## Failure Categories");

    lines.push("");

    for (const category of categories.slice(0, 10)) {
      lines.push(`- ${category.category}: ${category.count}`);
    }

    lines.push("");

    lines.push("## Top Impacted Features");

    lines.push("");

    for (const feature of features.slice(0, 10)) {
      lines.push(`- ${feature.feature}: ${feature.count}`);
    }

    lines.push("");

    lines.push("## Key Issues");

    lines.push("");

    for (const defect of defects.slice(0, 10)) {
      lines.push(`### ${defect.title}`);

      lines.push("");

      lines.push(`- Priority: ${defect.priority}`);

      lines.push(`- Affected Tests: ${defect.failureCount}`);

      lines.push(`- Affected Features: ${defect.impactedFeatures.length}`);

      lines.push("");
    }

    fs.writeFileSync(
      path.join(outputDir, "nightly-regression-report.md"),
      lines.join("\n"),
      "utf8",
    );
  }
}
