import { BackendIntegrationFailure } from "../../models/BackendIntegrationFailure";

export function parseFailures(failedTests: any[]): BackendIntegrationFailure[] {
  return (failedTests ?? []).map((failure): BackendIntegrationFailure => {
    const output = failure.output ?? "";

    const expected = output.match(/expected:\s*(\d+)/);

    const actual = output.match(/actual\s*:\s*(\d+)/);

    const missingField = output.match(
      /missing value for required field '([^']+)'/,
    );

    return {
      suite: failure.test.split("/")[0],

      test: failure.test,

      expectedStatus: expected?.[1],

      actualStatus: actual?.[1],

      rootCause: missingField ? `Missing field: ${missingField[1]}` : "Unknown",

      rawMessage: output,
    };
  });
}
