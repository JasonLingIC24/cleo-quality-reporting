export interface BackendIntegrationFailure {
  suite: string;

  test: string;

  expectedStatus?: string;

  actualStatus?: string;

  rootCause: string;

  rawMessage: string;
}
