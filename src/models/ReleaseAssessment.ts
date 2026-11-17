import { ReleaseRecommendation } from "../reports/management/buildReleaseRecommendation";

export interface ReleaseAssessment {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;

  passRate: number;
  failureRate: number;

  manualFailures: number;
  manualNotRun: number;
  manualNotApplicable: number;

  recommendation: ReleaseRecommendation;
}
