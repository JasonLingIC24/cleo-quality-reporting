import { ReleaseTestPlan } from "../models/ReleaseTestPlan";
import { ManualRegressionRun } from "../models/ManualRegressionRun";
import { TestPlanProgress } from "../models/TestPlanProgress";
import { WorkbookStatusCalculator } from "./WorkbookStatusCalculator";
import { WorkbookStatusType } from "../models/WorkbookStatus";

export class TestPlanProgressCalculator {
  static calculate(
    releaseTestPlan: ReleaseTestPlan,
    manualRegression: ManualRegressionRun[],
  ): TestPlanProgress {
    const workbookStatuses = WorkbookStatusCalculator.calculate(
      releaseTestPlan,
      manualRegression,
    );

    const countStatus = (status: WorkbookStatusType): number =>
      workbookStatuses.filter((workbook) => workbook.status === status).length;

    const plannedWorkbooks = workbookStatuses.length;

    const completeWorkbooks = countStatus("COMPLETE");

    const readyWorkbooks = countStatus("READY");

    const inProgressWorkbooks = countStatus("IN_PROGRESS");

    const notStartedWorkbooks = countStatus("NOT_STARTED");

    const completionPercentage =
      plannedWorkbooks > 0
        ? Number(((completeWorkbooks / plannedWorkbooks) * 100).toFixed(2))
        : 0;

    return {
      plannedWorkbooks,

      completeWorkbooks,

      readyWorkbooks,

      inProgressWorkbooks,

      notStartedWorkbooks,

      completionPercentage,
    };
  }
}
