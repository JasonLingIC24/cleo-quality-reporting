import type { FailedTest } from "../../models";

export interface FeatureRisk {
  feature: string;
  failures: number;
  rootCauses: number;
  rootCausePercentage: number;
  risk: string;
  attention: string;
}

export function buildFeatureRiskRanking(failures: FailedTest[]): FeatureRisk[] {
  const featureMap = new Map<
    string,
    {
      failures: number;
      rootCauses: number;
    }
  >();

  for (const failure of failures) {
    const feature = failure.feature || "Unknown";

    const current = featureMap.get(feature) ?? {
      failures: 0,
      rootCauses: 0,
    };

    current.failures++;

    if (failure) {
      current.rootCauses++;
    }

    featureMap.set(feature, current);
  }

  return Array.from(featureMap.entries())
    .map(([feature, values]) => {
      const rootCausePercentage =
        values.failures === 0 ? 0 : (values.rootCauses / values.failures) * 100;

      let risk = "Low";

      if (values.failures >= 15 || values.rootCauses >= 10) {
        risk = "Critical";
      } else if (values.failures >= 6 || values.rootCauses >= 5) {
        risk = "High";
      } else if (values.failures >= 3 || values.rootCauses >= 2) {
        risk = "Medium";
      }

      let attention = "Low";

      if (rootCausePercentage >= 75) {
        attention = "High";
      } else if (rootCausePercentage >= 50) {
        attention = "Medium";
      }

      return {
        feature,
        failures: values.failures,

        rootCauses: values.rootCauses,

        rootCausePercentage: Number(rootCausePercentage.toFixed(1)),

        risk,
        attention,
      };
    })
    .sort((a, b) => {
      if (b.rootCauses !== a.rootCauses) {
        return b.rootCauses - a.rootCauses;
      }

      return b.failures - a.failures;
    });
}
