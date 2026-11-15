import * as fs from "node:fs";
import * as path from "node:path";

import AdmZip from "adm-zip";

export class ArtifactExtractor {
  extract(artifactsDirectory = "./artifacts"): void {
    const extractionRoot = path.join(artifactsDirectory, "extracted");

    fs.mkdirSync(extractionRoot, {
      recursive: true,
    });

    const files = fs.readdirSync(artifactsDirectory);

    const zipFiles = files.filter((file) => file.endsWith(".zip"));

    for (const zipFile of zipFiles) {
      const destination = path.join(
        extractionRoot,
        this.getDestination(zipFile),
      );

      if (fs.existsSync(destination)) {
        console.log(`Skipping ${zipFile}`);

        continue;
      }

      console.log(`Extracting ${zipFile}`);

      fs.mkdirSync(destination, {
        recursive: true,
      });

      const zip = new AdmZip(path.join(artifactsDirectory, zipFile));

      zip.extractAllTo(destination, true);
    }
  }

  private getDestination(fileName: string): string {
    if (fileName.includes("_cypress")) {
      return "cypress";
    }

    if (fileName.includes("_backend-unit")) {
      return "backend-unit";
    }

    if (fileName.includes("_backend-integration")) {
      return "backend-integration";
    }

    if (fileName.includes("_frontend")) {
      return "frontend";
    }

    throw new Error(`Unknown artifact: ${fileName}`);
  }
}
