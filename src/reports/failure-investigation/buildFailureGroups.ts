import { FailedTest } from "../../models";

export function buildFailureGroups(failures: FailedTest[]): string {
  const grouped = new Map<string, FailedTest[]>();

  for (const failure of failures) {
    const key = [failure.rootCause, failure.selector ?? "none"].join("|");

    const current = grouped.get(key) ?? [];

    current.push(failure);

    grouped.set(key, current);
  }

  const duplicateGroups = [...grouped.values()].filter(
    (group) => group.length > 1,
  );

  if (duplicateGroups.length === 0) {
    return "";
  }

  const lines: string[] = [];

  lines.push("## Common Failure Groups");

  lines.push("");

  for (const group of duplicateGroups) {
    lines.push(`### ${group[0].rootCause}`);

    lines.push("");

    if (group[0].selector) {
      lines.push("Selector:");

      lines.push("");

      lines.push("```");

      lines.push(group[0].selector);

      lines.push("```");

      lines.push("");
    }

    lines.push("Affected Tests");

    lines.push("");

    for (const failure of group) {
      lines.push(`- ${failure.testCaseId}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
