import * as fs from "node:fs";
import * as path from "node:path";

import { TestSuiteRun } from "../../models/TestSuiteRun";

export class BackendUnitAdapter {
  parse(artifactPath: string): TestSuiteRun {
    const file = path.join(artifactPath, "test-summary.json");

    const json = JSON.parse(fs.readFileSync(file, "utf8"));

    return {
      suiteName: json.title,

      suiteType: "backend-unit",

      total: json.total,

      passed: json.passed,

      failed: json.failed,

      skipped: json.skipped,
    };
  }
}
