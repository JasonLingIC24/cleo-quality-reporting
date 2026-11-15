import { BackendIntegrationIssue } from "./BackendIntegrationIssue";
import { BackendIntegrationFailure } from "./BackendIntegrationFailure";

export interface TestSuiteRun {
  suiteName: string;

  suiteType: "cypress" | "frontend" | "backend-unit" | "backend-integration";

  total: number;

  passed: number;

  failed: number;

  skipped: number;

  issues?: BackendIntegrationIssue[];

  failures?: BackendIntegrationFailure[];
}
