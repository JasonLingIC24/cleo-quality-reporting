import { ReleaseRecommendation } from "../reports/management/buildReleaseRecommendation";

export interface ReleaseAssessment {
  totalTests: number;

  passed: number;

  failed: number;

  skipped: number;

  passRate: number;

  failureRate: number;

  manualFailures: number;

  manualNotExecuted: number;

  recommendation: ReleaseRecommendation;
}
