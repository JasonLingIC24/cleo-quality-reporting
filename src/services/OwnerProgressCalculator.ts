import { WorkbookStatus } from "../models/WorkbookStatus";
import { OwnerProgress } from "../models/OwnerProgress";

export class OwnerProgressCalculator {
  static calculate(workbookStatuses: WorkbookStatus[]): OwnerProgress[] {
    const owners = new Map<string, OwnerProgress>();

    for (const workbook of workbookStatuses) {
      const owner = workbook.owner ?? "Unassigned";

      if (!owners.has(owner)) {
        owners.set(owner, {
          owner,
          complete: 0,
          ready: 0,
          inProgress: 0,
          notStarted: 0,
        });
      }

      const progress = owners.get(owner)!;

      switch (workbook.status) {
        case "COMPLETE":
          progress.complete++;
          break;

        case "READY":
          progress.ready++;
          break;

        case "IN_PROGRESS":
          progress.inProgress++;
          break;

        case "NOT_STARTED":
          progress.notStarted++;
          break;
      }
    }

    return [...owners.values()].sort((a, b) => a.owner.localeCompare(b.owner));
  }
}
