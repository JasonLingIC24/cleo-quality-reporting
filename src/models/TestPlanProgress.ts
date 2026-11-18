export interface TestPlanProgress {
  plannedWorkbooks: number;

  completeWorkbooks: number;

  readyWorkbooks: number;

  inProgressWorkbooks: number;

  notStartedWorkbooks: number;

  completionPercentage: number;
}
