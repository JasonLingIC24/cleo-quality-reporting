import * as fs from "node:fs";
import * as path from "node:path";

import { TestSuiteRun } from "../../models/TestSuiteRun";
import { parseFailures } from "./parseFailures";

export class BackendIntegrationAdapter {
  parse(artifactPath: string): TestSuiteRun {
    const file = path.join(artifactPath, "integration-summary.json");

    const json = JSON.parse(fs.readFileSync(file, "utf8"));

    const failures = parseFailures(json.failedTests ?? []);

    return {
      suiteName: json.title,

      suiteType: "backend-integration",

      total: json.total,

      passed: json.passed,

      failed: json.failed,

      skipped: json.skipped,

      failures,
    };
  }
}
