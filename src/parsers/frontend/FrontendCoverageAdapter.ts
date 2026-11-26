import * as fs from "node:fs";
import * as path from "node:path";

import { CoverageSummary } from "../../models/CoverageSummary";

export class FrontendCoverageAdapter {
  parse(artifactPath: string): CoverageSummary {
    const file = path.join(artifactPath, "coverage", "coverage-summary.json");

    if (!fs.existsSync(file)) {
      console.warn(`Frontend coverage file not found: ${file}`);

      return {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0,
      };
    }

    const json = JSON.parse(fs.readFileSync(file, "utf8"));

    return {
      lines: json.total.lines.pct,

      statements: json.total.statements.pct,

      functions: json.total.functions.pct,

      branches: json.total.branches.pct,
    };
  }
}
