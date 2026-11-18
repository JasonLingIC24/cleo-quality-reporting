import { FailedTest } from "../../models";
import { buildInvestigationPriorityQueue } from "./buildInvestigationPriorityQueue";

export function buildEngineerIndex(failures: FailedTest[]): string {
  const lines: string[] = [];

  lines.push("# Nightly Failure Investigation Report");

  lines.push("");

  lines.push(`Generated: ${new Date().toISOString()}`);

  lines.push("");

  lines.push("## Executive Summary");

  lines.push("");

  lines.push(`Failed Tests: ${failures.length}`);

  lines.push("");

  const failingSpecs = new Set(failures.map((failure) => failure.specFile))
    .size;

  lines.push(`Failing Specs: ${failingSpecs}`);

  lines.push("");

  lines.push(buildInvestigationPriorityQueue(failures));

  lines.push(...buildFeatureSummary(failures));

  lines.push(...buildSpecBreakdown(failures));

  return lines.join("\n");
}

function buildFeatureSummary(failures: FailedTest[]): string[] {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.feature, (grouped.get(failure.feature) ?? 0) + 1);
  }

  const rows = [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const lines: string[] = [];

  lines.push("## Most Impacted Features");

  lines.push("");

  lines.push("| Feature | Failures |");

  lines.push("|---------|---------:|");

  for (const [feature, count] of rows) {
    lines.push(`| ${feature} | ${count} |`);
  }

  lines.push("");

  return lines;
}

function buildSpecBreakdown(failures: FailedTest[]): string[] {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.specFile, (grouped.get(failure.specFile) ?? 0) + 1);
  }

  const rows = [...grouped.entries()].sort((a, b) => b[1] - a[1]);

  const lines: string[] = [];

  lines.push("## Spec Breakdown");

  lines.push("");

  lines.push("| Spec Report | Failures |");

  lines.push("|-------------|---------:|");

  for (const [spec, count] of rows) {
    const markdownFile =
      spec.split("/").pop()?.replace(".spec.ts", ".md") ?? spec;

    lines.push(`| ${markdownFile} | ${count} |`);
  }

  lines.push("");

  return lines;
}
