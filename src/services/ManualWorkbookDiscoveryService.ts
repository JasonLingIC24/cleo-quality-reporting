import * as fs from "node:fs";
import * as path from "node:path";
import { ReleaseTestPlan } from "../models/ReleaseTestPlan";

export class ManualWorkbookDiscoveryService {
  static findAll(directory = "./artifacts/manual"): string[] {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".xlsx"))
      .map((file) => path.join(directory, file));
  }

  static findForReleasePlan(
    releaseTestPlan: ReleaseTestPlan,
    directory = "./artifacts/manual",
  ): string[] {
    const allWorkbooks = this.findAll(directory);

    return allWorkbooks.filter((workbookPath) => {
      const workbookName = path.basename(workbookPath, ".xlsx").toLowerCase();

      return releaseTestPlan.manualWorkbooks.some(
        (workbook) => workbook.id.toLowerCase() === workbookName,
      );
    });
  }
}
