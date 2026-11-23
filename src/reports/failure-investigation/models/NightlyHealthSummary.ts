export interface NightlyHealthSummary {
  cypress: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  backendUnit: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  backendIntegration: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  frontendCoverage: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}
