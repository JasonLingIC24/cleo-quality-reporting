export function getRunId(defaultRunId?: string): string {
  const runId = process.argv[2];

  if (runId) {
    return runId;
  }

  if (defaultRunId) {
    return defaultRunId;
  }

  throw new Error("GitHub Run ID is required");
}
