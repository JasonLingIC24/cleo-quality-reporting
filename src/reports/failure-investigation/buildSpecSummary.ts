import { FailedTest } from "../../models";

export function buildSpecSummary(failures: FailedTest[]): string {
  const counts = new Map<string, number>();

  for (const failure of failures) {
    counts.set(failure.rootCause, (counts.get(failure.rootCause) ?? 0) + 1);
  }

  const lines: string[] = [];

  lines.push("## Summary");

  lines.push("");

  lines.push("| Root Cause | Count |");

  lines.push("|------------|-------|");

  for (const [cause, count] of [...counts.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    lines.push(`| ${cause} | ${count} |`);
  }

  lines.push("");

  return lines.join("\n");
}
