import ExcelJS from "exceljs";

import { ManualRegressionRun } from "../../models/ManualRegressionRun";
import { ManualRegressionFailure } from "../../models/ManualRegressionFailure";

export class ManualRegressionWorkbookAdapter {
  async parse(workbookPath: string): Promise<ManualRegressionRun> {
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(workbookPath);

    const summarySheet = workbook.getWorksheet("Execution Summary");

    if (!summarySheet) {
      throw new Error(`Execution Summary sheet missing: ${workbookPath}`);
    }

    const executionSheet = workbook.worksheets.find(
      (sheet) => sheet.name !== "_lists" && sheet.name !== "Execution Summary",
    );

    console.log("\n=== EXECUTION SHEET HEADERS ===\n");

    for (let row = 1; row <= 40; row++) {
      const values: string[] = [];

      for (let col = 1; col <= 10; col++) {
        values.push(
          String(executionSheet?.getRow(row).getCell(col).value ?? ""),
        );
      }

      const populated = values.some((v) => v.trim() !== "");

      if (populated) {
        console.log(`Row ${row}:`, values);
      }
    }

    if (!executionSheet) {
      throw new Error("Execution sheet missing");
    }

    const featureId = executionSheet.name;

    const featureName = String(summarySheet.getCell("B4").value ?? "").trim();

    const scenarioCount = Number(summarySheet.getCell("B9").value ?? 0);

    const assertionCount = Number(summarySheet.getCell("B10").value ?? 0);

    const passed = this.countStatus(executionSheet, "Pass");

    const failed = this.countStatus(executionSheet, "Fail");

    const notExecuted = this.countStatus(executionSheet, "N/A");

    const manualTests = this.countEnvironment(executionSheet, "Manual");

    const automatedTests = this.countEnvironment(executionSheet, "Cypress");

    const failures = this.extractFailures(executionSheet);

    const executed = passed + failed;

    const passRate =
      executed > 0 ? Number(((passed / executed) * 100).toFixed(2)) : 0;

    return {
      featureId,

      featureName,

      scenarioCount,

      assertionCount,

      passed,

      failed,

      notExecuted,

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

  private extractFailures(sheet: ExcelJS.Worksheet): ManualRegressionFailure[] {
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
        testCaseId: String(row.getCell("A").value ?? "").trim(),

        scenario: String(row.getCell("B").value ?? "").trim(),

        given: String(row.getCell("C").value ?? "").trim(),

        when: String(row.getCell("D").value ?? "").trim(),

        then: String(row.getCell("E").value ?? "").trim(),

        expectedResult: String(row.getCell("E").value ?? "").trim(),

        notes: String(row.getCell("I").value ?? "").trim(),

        evidence: String(row.getCell("J").value ?? "").trim(),
      });
    });

    return failures;
  }
}
