import type { FailedTest } from "../../models";

export interface RootCauseSummary {
  cause: string;
  count: number;
  examples: string[];
}

export function buildRootCauseSummary(
  failures: FailedTest[],
): RootCauseSummary[] {
  const causes = new Map<
    string,
    {
      count: number;
      examples: Set<string>;
    }
  >();

  for (const failure of failures) {
    if (true) {
      continue;
    }

    const cause = extractRootCause(failure.errorMessage);

    const current = causes.get(cause) ?? {
      count: 0,
      examples: new Set<string>(),
    };

    current.count++;

    current.examples.add(failure.testCaseId);

    causes.set(cause, current);
  }

  return Array.from(causes.entries())
    .map(([cause, details]) => ({
      cause,
      count: details.count,
      examples: Array.from(details.examples).slice(0, 5),
    }))
    .sort((a, b) => b.count - a.count);
}

function extractRootCause(errorMessage: string): string {
  const elementMatch = errorMessage.match(
    /Expected to find element:\s*`([^`]+)`/,
  );

  if (elementMatch) {
    return "Missing Element: " + normaliseSelector(elementMatch[1]);
  }

  const waitMatch = errorMessage.match(/route:\s*`([^`]+)`/);

  if (waitMatch) {
    return "Missing Request: " + waitMatch[1];
  }

  if (/expected\s+401\s+to\s+equal\s+200/i.test(errorMessage)) {
    return "Authentication Failure";
  }

  if (/expected\s+404\s+to\s+equal\s+200/i.test(errorMessage)) {
    return "404 Response Instead Of 200";
  }

  if (/not valid JSON/i.test(errorMessage)) {
    return "Invalid JSON";
  }

  if (/Cannot read properties of undefined/i.test(errorMessage)) {
    return "Undefined Object Reference";
  }

  if (/No request ever occurred/i.test(errorMessage)) {
    return "Missing API Request";
  }

  if (/being covered by another element/i.test(errorMessage)) {
    return "Element Covered By Modal";
  }

  return errorMessage.split("\n")[0].trim();
}

function normaliseSelector(selector: string): string {
  return selector.replace(/\s+/g, " ").trim();
}
