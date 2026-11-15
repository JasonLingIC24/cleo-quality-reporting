import * as path from "node:path";

import { ArtifactSet } from "../models/ArtifactSet";

export class ArtifactPaths {
  static mochawesome(artifacts: ArtifactSet): string {
    return path.join(artifacts.cypressPath, "mochawesome.json");
  }
}
