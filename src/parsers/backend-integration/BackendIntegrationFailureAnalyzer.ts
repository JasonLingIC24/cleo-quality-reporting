import { BackendIntegrationIssue } from "../../models/BackendIntegrationIssue";

export class BackendIntegrationFailureAnalyzer {
  static analyse(failures: any[]): BackendIntegrationIssue[] {
    const groups = new Map<string, BackendIntegrationIssue>();

    for (const failure of failures) {
      const key = failure.suiteName ?? "Unknown";

      if (!groups.has(key)) {
        groups.set(key, {
          title: key,

          failureCount: 0,

          suites: [key],

          errorMessage: failure.errorMessage ?? "",
        });
      }

      groups.get(key)!.failureCount++;
    }

    return [...groups.values()].sort((a, b) => b.failureCount - a.failureCount);
  }
}
