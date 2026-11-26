import * as fs from "fs/promises";
import { TestRun } from "../../models";
import { extractFailedTests } from "./extractFailedTests";

export class MochawesomeParser {
  async parse(reportPath: string, screenshotsRoot: string): Promise<TestRun> {
    try {
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
    } catch (error) {
      console.warn(`Unable to load Mochawesome report: ${reportPath}`);

      return {
        executionDate: new Date().toISOString(),
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        failedTests: [],
      };
    }
  }
}
