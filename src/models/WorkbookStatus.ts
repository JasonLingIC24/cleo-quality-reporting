export type WorkbookStatusType =
  "NOT_STARTED" | "READY" | "IN_PROGRESS" | "COMPLETE";

export interface WorkbookStatus {
  workbookId: string;

  owner?: string;

  status: WorkbookStatusType;
}
