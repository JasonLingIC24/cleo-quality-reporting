export interface FailedTest {
  testCaseId: string;

  feature: string;

  specFile: string;

  title: string;

  scenario: string[];

  thenStep: string;

  rootCause: string;

  selector?: string;

  tags: string[];

  duration: number;

  hook: string;

  errorMessage: string;

  stackTrace?: string;

  screenshotPaths: string[];

  videoPath?: string;
}

export interface TestRun {
  executionDate: string;

  totalTests: number;

  passed: number;

  failed: number;

  skipped: number;

  failedTests: FailedTest[];
}
