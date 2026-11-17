import * as path from "node:path";

import { ArtifactSet } from "../models/ArtifactSet";

export class ArtifactDiscoveryService {
  static findForRun(runDirectory: string): ArtifactSet {
    const extractedDirectory = path.join(runDirectory, "extracted");

    return {
      cypressPath: path.join(extractedDirectory, "cypress"),

      backendUnitPath: path.join(extractedDirectory, "backend-unit"),

      backendIntegrationPath: path.join(
        extractedDirectory,
        "backend-integration",
      ),

      frontendPath: path.join(extractedDirectory, "frontend"),
    };
  }
}
