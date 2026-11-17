import * as fs from "node:fs";

import { ReleaseTestPlan } from "../models/ReleaseTestPlan";

export class ReleaseTestPlanAdapter {
  static load(filePath: string): ReleaseTestPlan {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as ReleaseTestPlan;
  }
}
