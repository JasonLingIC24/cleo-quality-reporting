import type { FailedTest } from "../../models";

export interface CandidateDefect {
  title: string;
  rootCause: string;
  impactedFeatures: string[];
  impactedTests: string[];
  failureCount: number;
  priority: string;
}

export function buildCandidateDefects(
  failures: FailedTest[],
): CandidateDefect[] {
  const defectMap = new Map<
    string,
    {
      features: Set<string>;
      tests: Set<string>;
      count: number;
    }
  >();

  for (const failure of failures) {
    // all failures included

    const rootCause = identifyRootCause(failure.errorMessage);

    const current = defectMap.get(rootCause) ?? {
      features: new Set<string>(),
      tests: new Set<string>(),
      count: 0,
    };

    current.count++;

    current.features.add(failure.feature);

    current.tests.add(failure.testCaseId);

    defectMap.set(rootCause, current);
  }

  return Array.from(defectMap.entries())
    .map(([rootCause, details]) => ({
      title: buildDefectTitle(rootCause),

      rootCause,

      impactedFeatures: Array.from(details.features),

      impactedTests: Array.from(details.tests),

      failureCount: details.count,

      priority: determinePriority(details.count),
    }))
    .sort((a, b) => b.failureCount - a.failureCount);
}

function determinePriority(count: number): string {
  if (count >= 8) {
    return "Critical";
  }

  if (count >= 5) {
    return "High";
  }

  if (count >= 3) {
    return "Medium";
  }

  return "Low";
}

function buildDefectTitle(rootCause: string): string {
  if (rootCause.startsWith("Missing Element:")) {
    return rootCause.replace("Missing Element:", "").trim();
  }

  return rootCause;
}

function identifyRootCause(errorMessage: string): string {
  const elementMatch = errorMessage.match(
    /Expected to find element:\s*`([^`]+)`/,
  );

  if (elementMatch) {
    return `Missing Element: ${elementMatch[1]}`;
  }

  const waitMatch = errorMessage.match(/route:\s*`([^`]+)`/);

  if (waitMatch) {
    return `Missing Request: ${waitMatch[1]}`;
  }

  if (/expected 401 to equal 200/i.test(errorMessage)) {
    return "Authentication Failure";
  }

  if (/expected 404 to equal 200/i.test(errorMessage)) {
    return "404 Response Instead Of 200";
  }

  if (/being covered by another element/i.test(errorMessage)) {
    return "Element Covered By Modal";
  }

  return errorMessage.split("\n")[0].trim();
}
