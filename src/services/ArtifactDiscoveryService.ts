import * as path from "node:path";

import { ArtifactSet } from "../models/ArtifactSet";

export class ArtifactDiscoveryService {
  static findLatest(rootDirectory = "./artifacts/extracted"): ArtifactSet {
    return {
      cypressPath: path.join(rootDirectory, "cypress"),

      backendUnitPath: path.join(rootDirectory, "backend-unit"),

      backendIntegrationPath: path.join(rootDirectory, "backend-integration"),

      frontendPath: path.join(rootDirectory, "frontend"),
    };
  }
}
