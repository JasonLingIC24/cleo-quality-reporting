import { FailedTest } from "../../models";

interface PriorityGroup {
  key: string;
  failures: number;
  specs: Set<string>;
}

export function buildInvestigationPriorityQueue(
  failures: FailedTest[],
): string {
  const grouped = new Map<string, PriorityGroup>();

  for (const failure of failures) {
    const key = failure.selector ?? failure.rootCause;

    const existing = grouped.get(key) ?? {
      key,
      failures: 0,
      specs: new Set<string>(),
    };

    existing.failures++;
    existing.specs.add(failure.specFile);

    grouped.set(key, existing);
  }

  const rows = [...grouped.values()]
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 10);

  const lines: string[] = [];

  lines.push("## Investigation Priority Queue");

  lines.push("");

  lines.push("| Root Cause | Failures | Specs |");

  lines.push("|------------|---------:|------:|");

  for (const row of rows) {
    lines.push(`| ${row.key} | ${row.failures} | ${row.specs.size} |`);
  }

  lines.push("");

  return lines.join("\n");
}
