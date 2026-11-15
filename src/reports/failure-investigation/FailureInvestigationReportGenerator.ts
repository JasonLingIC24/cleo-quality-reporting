import * as fs from "node:fs/promises";
import * as path from "node:path";

import { FailedTest, TestRun } from "../../models";
import { buildEngineerIndex } from "./buildInvestigationIndex";
import { buildFailureGroups } from "./buildFailureGroups";
import { buildSpecSummary } from "./buildSpecSummary";

export class FailureInvestigationReportGenerator {
  async generate(testRun: TestRun): Promise<void> {
    const outputDir = "./reports/failure-investigation";

    await fs.mkdir(outputDir, { recursive: true });

    const indexContent = buildEngineerIndex(testRun.failedTests);

    await fs.writeFile(path.join(outputDir, "index.md"), indexContent, "utf8");

    const groupedFailures = this.groupBySpec(testRun.failedTests);

    for (const [specFile, failures] of groupedFailures) {
      const markdown = this.buildMarkdown(specFile, failures);

      const fileName = this.buildFileName(specFile);

      await fs.writeFile(path.join(outputDir, fileName), markdown, "utf8");
    }
  }

  private groupBySpec(failures: FailedTest[]): Map<string, FailedTest[]> {
    const grouped = new Map<string, FailedTest[]>();

    for (const failure of failures) {
      const current = grouped.get(failure.specFile) ?? [];

      current.push(failure);

      grouped.set(failure.specFile, current);
    }

    return grouped;
  }

  private buildFileName(specFile: string): string {
    const baseName = path.basename(specFile);

    return baseName.replace(".spec.ts", ".md");
  }

  private buildMarkdown(specFile: string, failures: FailedTest[]): string {
    const lines: string[] = [];

    lines.push(`# ${path.basename(specFile)}`);

    lines.push("");

    lines.push(`Spec File: ${specFile}`);

    lines.push("");

    lines.push(`Failures: ${failures.length}`);

    lines.push("");

    lines.push(buildSpecSummary(failures));

    lines.push("");

    const failureGroups = buildFailureGroups(failures);

    if (failureGroups) {
      lines.push(failureGroups);

      lines.push("");
    }

    const video = failures.find((f) => f.videoPath)?.videoPath;

    if (video) {
      lines.push(`Video: ${video}`);

      lines.push("");
    }

    for (const failure of failures) {
      lines.push(`## ${failure.testCaseId}`);

      lines.push("");

      lines.push("### Scenario");

      lines.push("");

      for (const step of failure.scenario) {
        if (step.startsWith("Feature:")) {
          continue;
        }

        lines.push(step);

        lines.push("");
      }

      lines.push(failure.thenStep);

      lines.push("");

      lines.push("### Root Cause");

      lines.push("");

      lines.push(`Type: ${failure.rootCause}`);

      lines.push("");

      if (failure.selector) {
        lines.push("Selector:");

        lines.push("");

        lines.push("```");

        lines.push(failure.selector);

        lines.push("```");

        lines.push("");
      }

      lines.push(`Hook: ${failure.hook}`);

      lines.push("");

      lines.push("### Evidence");

      lines.push("");

      if (failure.screenshotPaths.length > 0) {
        lines.push("Screenshots:");

        lines.push("");

        for (const screenshot of failure.screenshotPaths) {
          const fileName = this.getDisplayScreenshotName(screenshot);

          lines.push(`- ${this.createMarkdownLink(fileName, screenshot)}`);
        }

        lines.push("");
      }

      if (failure.videoPath) {
        lines.push("Video:");

        lines.push("");

        lines.push(
          `- ${this.createMarkdownLink(
            path.basename(failure.videoPath),
            failure.videoPath,
          )}`,
        );

        lines.push("");
      }

      lines.push("### Error");

      lines.push("");

      lines.push("```");

      lines.push(failure.errorMessage);

      lines.push("```");

      lines.push("");

      lines.push("---");

      lines.push("");
    }

    return lines.join("\n");
  }

  private getDisplayScreenshotName(screenshotPath: string): string {
    const fileName = path.basename(screenshotPath);

    const testCaseMatch = fileName.match(/\[(.*?)\]/);

    const hookMatch = fileName.match(/(before all hook|before each hook)/i);

    const testCaseId = testCaseMatch?.[1];

    const hook = hookMatch?.[1];

    if (testCaseId && hook) {
      return `${testCaseId} (${hook}).png`;
    }

    if (testCaseId) {
      return `${testCaseId}.png`;
    }

    return fileName;
  }

  private createMarkdownLink(text: string, target: string): string {
    return `[${text}](${target})`;
  }
}
