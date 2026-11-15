import { TestRun } from "../models";

export interface ReportGenerator {
  generate(report: TestRun): Promise<void>;
}
