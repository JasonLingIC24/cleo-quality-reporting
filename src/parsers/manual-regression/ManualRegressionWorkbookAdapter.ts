import ExcelJS from "exceljs";
import * as path from "node:path";
import { ManualRegressionRun } from "../../models/ManualRegressionRun";
import { ManualRegressionFailure } from "../../models/ManualRegressionFailure";

export class ManualRegressionWorkbookAdapter {
  async parse(workbookPath: string): Promise<ManualRegressionRun> {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(workbookPath);

    const executionSheet = workbook.worksheets.find(
      (sheet) => sheet.name !== "_lists",
    );

    if (!executionSheet) {
      throw new Error(`Execution sheet missing: ${workbookPath}`);
    }

    const workbookId = path.basename(workbookPath, ".xlsx");

    const featureId =
      this.getMetadataValue(executionSheet, "Feature ID") ||
      executionSheet.name;

    const featureName = this.getMetadataValue(executionSheet, "Feature");

    const scenarioCountRaw = Number(
      this.getMetadataValue(executionSheet, "Scenario Count"),
    );

    const scenarioCount = Number.isFinite(scenarioCountRaw)
      ? scenarioCountRaw
      : 0;

    const assertionCountRaw = Number(
      this.getMetadataValue(executionSheet, "Assertion Count"),
    );

    const assertionCount = Number.isFinite(assertionCountRaw)
      ? assertionCountRaw
      : this.countAssertions(executionSheet);

    const passed = this.countStatus(executionSheet, "Pass");

    const failed = this.countStatus(executionSheet, "Fail");

    const notRun = this.countStatus(executionSheet, "Not Run");

    const notApplicable = this.countStatus(executionSheet, "N/A");

    const manualTests = this.countEnvironment(executionSheet, "Manual");

    const automatedTests = this.countEnvironment(executionSheet, "Cypress");

    const failures = this.extractFailures(
      executionSheet,
      featureId,
      featureName,
    );

    const executed = passed + failed;

    const passRate =
      executed > 0 ? Number(((passed / executed) * 100).toFixed(2)) : 0;

    return {
      workbookId,

      featureId,
      featureName,

      scenarioCount,
      assertionCount,

      passed,
      failed,

      notRun,
      notApplicable,

      passRate,

      manualTests,
      automatedTests,

      failures,
    };
  }

  private countStatus(sheet: ExcelJS.Worksheet, status: string): number {
    let count = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 11) {
        return;
      }

      const value = String(row.getCell("G").value ?? "").trim();

      if (value === status) {
        count++;
      }
    });

    return count;
  }

  private countEnvironment(
    sheet: ExcelJS.Worksheet,
    environment: string,
  ): number {
    let count = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 11) {
        return;
      }

      const value = String(row.getCell("H").value ?? "").trim();

      if (value === environment) {
        count++;
      }
    });

    return count;
  }

  private countAssertions(sheet: ExcelJS.Worksheet): number {
    let count = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 11) {
        return;
      }

      const testCaseId = String(row.getCell("A").value ?? "").trim();

      if (testCaseId) {
        count++;
      }
    });

    return count;
  }

  private countUniqueTestCases(sheet: ExcelJS.Worksheet): number {
    const scenarios = new Set<string>();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 11) {
        return;
      }

      const testCaseId = String(row.getCell("A").value ?? "").trim();

      if (testCaseId) {
        scenarios.add(testCaseId);
      }
    });

    return scenarios.size;
  }

  private extractFailures(
    sheet: ExcelJS.Worksheet,
    featureId: string,
    featureName: string,
  ): ManualRegressionFailure[] {
    const failures: ManualRegressionFailure[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 11) {
        return;
      }

      const status = String(row.getCell("G").value ?? "").trim();

      if (status !== "Fail") {
        return;
      }

      failures.push({
        featureId,
        featureName,

        testCaseId: this.cellToString(row.getCell("A").value),

        scenario: this.cellToString(row.getCell("B").value),

        given: this.cellToString(row.getCell("C").value),

        when: this.cellToString(row.getCell("D").value),

        then: this.cellToString(row.getCell("E").value),

        expectedResult: this.cellToString(row.getCell("E").value),

        notes: this.cellToString(row.getCell("I").value),

        evidence: this.cellToString(row.getCell("J").value),
      });
    });

    return failures;
  }

  private getMetadataValue(sheet: ExcelJS.Worksheet, label: string): string {
    for (let row = 1; row <= 11; row++) {
      const key = this.cellToString(sheet.getCell(`A${row}`).value);

      if (key !== label) {
        continue;
      }

      const value =
        this.cellToString(sheet.getCell(`B${row}`).value) ||
        this.cellToString(sheet.getCell(`C${row}`).value);

      return value;
    }

    return "";
  }

  private cellToString(value: unknown): string {
    if (value == null) {
      return "";
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value).trim();
    }

    if (typeof value === "object" && value !== null && "text" in value) {
      return String(value.text).trim();
    }

    if (typeof value === "object" && value !== null && "result" in value) {
      return String(value.result ?? "").trim();
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "richText" in value &&
      Array.isArray(value.richText)
    ) {
      return value.richText
        .map((part: { text?: string }) => part.text ?? "")
        .join("")
        .trim();
    }

    return String(value).trim();
  }
}
