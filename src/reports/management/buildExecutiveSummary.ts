import type { FailedTest } from "../../models";

export interface ExecutiveSummary {
  overallRisk: string;

  criticalFeatures: number;

  highRiskFeatures: number;

  mediumRiskFeatures: number;

  lowRiskFeatures: number;

  mostCommonFailure: string;

  mostCommonFailureCount: number;

  topImpactFeature: string;
}

export function buildExecutiveSummary(
  failures: FailedTest[],
): ExecutiveSummary {
  const featureCounts = new Map<string, number>();

  const failureTypes = new Map<string, number>();

  const rootCauseFeatures = new Map<string, number>();

  for (const failure of failures) {
    featureCounts.set(
      failure.feature,
      (featureCounts.get(failure.feature) ?? 0) + 1,
    );

    failureTypes.set(
      failure.rootCause,
      (failureTypes.get(failure.rootCause) ?? 0) + 1,
    );

    if (failure) {
      rootCauseFeatures.set(
        failure.feature,
        (rootCauseFeatures.get(failure.feature) ?? 0) + 1,
      );
    }
  }

  let criticalFeatures = 0;
  let highRiskFeatures = 0;
  let mediumRiskFeatures = 0;
  let lowRiskFeatures = 0;

  for (const [, count] of rootCauseFeatures.entries()) {
    if (count >= 10) {
      criticalFeatures++;
    } else if (count >= 5) {
      highRiskFeatures++;
    } else if (count >= 2) {
      mediumRiskFeatures++;
    } else {
      lowRiskFeatures++;
    }
  }

  let overallRisk = "Low";

  if (criticalFeatures > 0) {
    overallRisk = "Critical";
  } else if (highRiskFeatures > 0) {
    overallRisk = "High";
  } else if (mediumRiskFeatures > 0) {
    overallRisk = "Medium";
  }

  const mostCommonFailure = Array.from(failureTypes.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const topImpactFeature = Array.from(rootCauseFeatures.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    overallRisk,

    criticalFeatures,

    highRiskFeatures,

    mediumRiskFeatures,

    lowRiskFeatures,

    mostCommonFailure: mostCommonFailure?.[0] ?? "Unknown",

    mostCommonFailureCount: mostCommonFailure?.[1] ?? 0,

    topImpactFeature: topImpactFeature?.[0] ?? "Unknown",
  };
}
