import { TestRun } from "../models";

export interface Parser {
  parse(path: string): Promise<TestRun>;
}
