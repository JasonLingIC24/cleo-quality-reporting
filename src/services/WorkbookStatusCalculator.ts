import { ManualRegressionRun } from "../models/ManualRegressionRun";
import { ReleaseTestPlan } from "../models/ReleaseTestPlan";
import { WorkbookStatus } from "../models/WorkbookStatus";

export class WorkbookStatusCalculator {
  static calculate(
    releaseTestPlan: ReleaseTestPlan,
    manualRegression: ManualRegressionRun[],
  ): WorkbookStatus[] {
    return releaseTestPlan.manualWorkbooks.map((plannedWorkbook) => {
      const workbook = manualRegression.find(
        (run) =>
          run.workbookId.toLowerCase() === plannedWorkbook.id.toLowerCase(),
      );

      if (!workbook) {
        return {
          workbookId: plannedWorkbook.id,
          owner: plannedWorkbook.owner,
          status: "NOT_STARTED",
        };
      }

      if (
        workbook.passed === 0 &&
        workbook.failed === 0 &&
        workbook.assertionCount > 0
      ) {
        return {
          workbookId: plannedWorkbook.id,
          owner: plannedWorkbook.owner,
          status: "READY",
        };
      }

      if (workbook.passed + workbook.failed > 0 && workbook.notRun > 0) {
        return {
          workbookId: plannedWorkbook.id,
          owner: plannedWorkbook.owner,
          status: "IN_PROGRESS",
        };
      }

      if (workbook.notRun === 0) {
        return {
          workbookId: plannedWorkbook.id,
          owner: plannedWorkbook.owner,
          status: "COMPLETE",
        };
      }

      return {
        workbookId: plannedWorkbook.id,
        owner: plannedWorkbook.owner,
        status: "NOT_STARTED",
      };
    });
  }
}
