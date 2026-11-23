import { FailedTest } from "../../models";
import { buildInvestigationPriorityQueue } from "./buildInvestigationPriorityQueue";
import { NightlyHealthSummary } from "./models/NightlyHealthSummary";

export function buildEngineerIndex(
  failures: FailedTest[],
  healthSummary: NightlyHealthSummary,
): string {
  const lines: string[] = [];

  lines.push("# Nightly Failure Investigation Report");

  lines.push("");

  lines.push("## Nightly Health");

  lines.push("");

  lines.push("| Area | Status | Details |");

  lines.push("|------|--------|---------|");

  lines.push(
    `| Cypress | ${healthStatus(
      healthSummary.cypress.failed > 0 ? "FAILED" : "HEALTHY",
    )} | ${healthSummary.cypress.failed} failures from ${healthSummary.cypress.total} tests |`,
  );

  lines.push(
    `| Backend Unit | ${healthStatus(
      healthSummary.backendUnit.total === 0
        ? "UNAVAILABLE"
        : healthSummary.backendUnit.failed > 0
          ? "FAILED"
          : "HEALTHY",
    )} | ${
      healthSummary.backendUnit.total === 0
        ? "Summary artifact missing"
        : `${healthSummary.backendUnit.passed}/${healthSummary.backendUnit.total} passed`
    } |`,
  );

  lines.push(
    `| Backend Integration | ${healthStatus(
      healthSummary.backendIntegration.total === 0
        ? "UNAVAILABLE"
        : healthSummary.backendIntegration.failed > 0
          ? "FAILED"
          : healthSummary.backendIntegration.skipped > 0
            ? "MONITOR"
            : "HEALTHY",
    )} | ${
      healthSummary.backendIntegration.total === 0
        ? "Summary artifact missing"
        : `${healthSummary.backendIntegration.passed} passed, ${healthSummary.backendIntegration.skipped} skipped`
    } |`,
  );

  lines.push(
    `| Frontend Coverage | ${healthStatus(
      healthSummary.frontendCoverage.lines >= 80
        ? "HEALTHY"
        : healthSummary.frontendCoverage.lines >= 70
          ? "MONITOR"
          : "LOW",
    )} | Lines ${healthSummary.frontendCoverage.lines}% |`,
  );

  lines.push("");

  lines.push(`Report Generated: ${formatDate(new Date())} UTC`);

  lines.push("");

  lines.push("## Executive Summary");

  lines.push("");

  lines.push(`Failed Tests: ${failures.length}`);

  lines.push("");

  const failingSpecs = new Set(failures.map((failure) => failure.specFile))
    .size;

  lines.push(`Failing Specs: ${failingSpecs}`);

  lines.push("");

  const topRootCause = getTopRootCause(failures);

  if (topRootCause) {
    lines.push(
      `Top Failure Category: ${topRootCause.cause} (${topRootCause.count} failures)`,
    );

    lines.push("");
  }

  const topFeature = getTopFeature(failures);

  if (topFeature) {
    lines.push(
      `Top Impacted Feature: ${topFeature.feature} (${topFeature.count} failures)`,
    );

    lines.push("");
  }

  const topSpec = getTopSpec(failures);

  if (topSpec) {
    lines.push(`Top Failing Spec: ${topSpec.spec} (${topSpec.count} failures)`);

    lines.push("");
  }

  lines.push(buildInvestigationPriorityQueue(failures));

  lines.push(...buildFeatureSummary(failures));

  lines.push(...buildSpecBreakdown(failures));

  return lines.join("\n");
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
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

  const rows = [...grouped.entries()]
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1]);

  const totalFailingSpecs = grouped.size;

  const hiddenSpecs = totalFailingSpecs - rows.length;

  const lines: string[] = [];

  lines.push("## Spec Breakdown");

  lines.push("");

  lines.push(`Showing ${rows.length} specs with 5 or more failures`);

  lines.push("");

  if (hiddenSpecs > 0) {
    lines.push(
      `${hiddenSpecs} additional failing specs have fewer than 5 failures.`,
    );

    lines.push("");
  }

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

function healthStatus(status: string): string {
  switch (status) {
    case "HEALTHY":
      return "✅ Healthy";

    case "MONITOR":
      return "⚠️ Monitor";

    case "LOW":
      return "⚠️ Low";

    case "UNAVAILABLE":
      return "⚪ Not Available";

    case "FAILED":
      return "🔴 Failed";

    case "READY":
      return "🔵 Ready";

    case "COMPLETE":
      return "✅ Complete";

    default:
      return status;
  }
}

function getTopRootCause(
  failures: FailedTest[],
): { cause: string; count: number } | undefined {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.rootCause, (grouped.get(failure.rootCause) ?? 0) + 1);
  }

  const top = [...grouped.entries()].sort((a, b) => b[1] - a[1])[0];

  if (!top) {
    return undefined;
  }

  return {
    cause: top[0],
    count: top[1],
  };
}

function getTopFeature(
  failures: FailedTest[],
): { feature: string; count: number } | undefined {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.feature, (grouped.get(failure.feature) ?? 0) + 1);
  }

  const top = [...grouped.entries()].sort((a, b) => b[1] - a[1])[0];

  if (!top) {
    return undefined;
  }

  return {
    feature: top[0],
    count: top[1],
  };
}

function getTopSpec(
  failures: FailedTest[],
): { spec: string; count: number } | undefined {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.specFile, (grouped.get(failure.specFile) ?? 0) + 1);
  }

  const top = [...grouped.entries()].sort((a, b) => b[1] - a[1])[0];

  if (!top) {
    return undefined;
  }

  return {
    spec: top[0].split("/").pop()?.replace(".spec.ts", ".md") ?? top[0],
    count: top[1],
  };
}
