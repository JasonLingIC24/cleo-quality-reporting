export interface BackendIntegrationIssue {
  title: string;

  failureCount: number;

  suites: string[];

  errorMessage: string;
}
