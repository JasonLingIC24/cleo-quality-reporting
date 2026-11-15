import { FailedTest } from "../../models";

export function buildEngineerIndex(failures: FailedTest[]): string {
  const grouped = new Map<string, number>();

  for (const failure of failures) {
    grouped.set(failure.specFile, (grouped.get(failure.specFile) ?? 0) + 1);
  }

  const rows = [...grouped.entries()].sort((a, b) => b[1] - a[1]);

  const lines: string[] = [];

  lines.push("# Failure Investigation Reports");

  lines.push("");

  lines.push(`Generated: ${new Date().toISOString()}`);

  lines.push("");

  lines.push("| Spec File | Failures |");

  lines.push("|-----------|----------|");

  for (const [spec, count] of rows) {
    lines.push(`| ${spec} | ${count} |`);
  }

  return lines.join("\n");
}
