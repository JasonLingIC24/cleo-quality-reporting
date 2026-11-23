export interface ReleaseTestPlan {
  releaseVersion: string;

  releaseDate: string;

  githubRunId: string;

  manualWorkbooks: ReleaseWorkbook[];
}

export interface ReleaseWorkbook {
  workbookId: string;

  owner?: string;

  required?: boolean;
}
