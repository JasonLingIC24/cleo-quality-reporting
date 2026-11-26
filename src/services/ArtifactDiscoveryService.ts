import * as fs from "node:fs";
import * as path from "node:path";

import { ArtifactSet } from "../models/ArtifactSet";

export class ArtifactDiscoveryService {
  static findForRun(runDirectory: string): ArtifactSet {
    const extractedDirectory = path.join(runDirectory, "extracted");

    const cypressPath = path.join(extractedDirectory, "cypress");

    const backendUnitPath = path.join(extractedDirectory, "backend-unit");

    const backendIntegrationPath = path.join(
      extractedDirectory,
      "backend-integration",
    );

    const frontendPath = path.join(extractedDirectory, "frontend");

    return {
      cypressPath,

      backendUnitPath: fs.existsSync(backendUnitPath) ? backendUnitPath : "",

      backendIntegrationPath: fs.existsSync(backendIntegrationPath)
        ? backendIntegrationPath
        : "",

      frontendPath: fs.existsSync(frontendPath) ? frontendPath : "",
    };
  }
}
