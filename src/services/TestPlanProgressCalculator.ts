import { ReleaseTestPlan } from "../models/ReleaseTestPlan";
import { ManualRegressionRun } from "../models/ManualRegressionRun";
import { TestPlanProgress } from "../models/TestPlanProgress";

export class TestPlanProgressCalculator {
  static calculate(
    releaseTestPlan: ReleaseTestPlan,
    manualRegression: ManualRegressionRun[],
  ): TestPlanProgress {
    const plannedWorkbooks = releaseTestPlan.manualWorkbooks.length;

    let completeWorkbooks = 0;
    let inProgressWorkbooks = 0;
    let notStartedWorkbooks = 0;

    for (const plannedWorkbook of releaseTestPlan.manualWorkbooks) {
      const workbook = manualRegression.find(
        (run) =>
          run.featureId.toLowerCase() === plannedWorkbook.id.toLowerCase(),
      );

      if (!workbook) {
        notStartedWorkbooks++;

        continue;
      }

      //
      // COMPLETE
      //
      if (workbook.notRun === 0) {
        completeWorkbooks++;

        continue;
      }

      //
      // IN PROGRESS
      //
      if (workbook.passed + workbook.failed > 0 && workbook.notRun > 0) {
        inProgressWorkbooks++;

        continue;
      }

      //
      // NOT STARTED
      //
      notStartedWorkbooks++;
    }

    const completionPercentage =
      plannedWorkbooks > 0
        ? Number(((completeWorkbooks / plannedWorkbooks) * 100).toFixed(2))
        : 0;

    return {
      plannedWorkbooks,
      completeWorkbooks,
      inProgressWorkbooks,
      notStartedWorkbooks,
      completionPercentage,
    };
  }
}
