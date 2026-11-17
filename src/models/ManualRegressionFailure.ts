export interface ManualRegressionFailure {
  featureId: string;
  featureName: string;

  testCaseId: string;
  scenario: string;

  given?: string;
  when?: string;
  then?: string;

  expectedResult: string;

  notes?: string;
  evidence?: string;
}
