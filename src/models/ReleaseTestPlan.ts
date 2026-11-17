export interface ReleaseTestPlan {
  releaseVersion: string;

  releaseDate: string;

  githubRunId: string;

  manualWorkbooks: ReleaseWorkbook[];
}

export interface ReleaseWorkbook {
  id: string;

  owner?: string;

  required?: boolean;
}
