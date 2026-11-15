export function classifyFailure(errorMessage: string): string {
  const error = errorMessage.toLowerCase();

  if (error.includes("expected to find element")) {
    return "Element Missing";
  }

  if (error.includes("timed out retrying")) {
    return "Timeout";
  }

  if (error.includes("401")) {
    return "Authentication";
  }

  if (error.includes("403")) {
    return "Authorisation";
  }

  if (error.includes("500")) {
    return "Backend Error";
  }

  if (error.includes("assertionerror")) {
    return "Assertion Failure";
  }

  return "Unknown";
}
