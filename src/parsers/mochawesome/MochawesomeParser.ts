import * as fs from "fs/promises";
import { TestRun } from "../../models";
import { extractFailedTests } from "./extractFailedTests";

export class MochawesomeParser {
  async parse(reportPath: string, screenshotsRoot: string): Promise<TestRun> {
    const content = await fs.readFile(reportPath, "utf8");

    const json = JSON.parse(content);

    console.log("Loaded Mochawesome File");

    return {
      executionDate: json.stats.start,

      totalTests: json.stats.tests,

      passed: json.stats.passes,

      failed: json.stats.failures,

      skipped: json.stats.skipped,

      failedTests: extractFailedTests(json.results, screenshotsRoot),
    };
  }
}
