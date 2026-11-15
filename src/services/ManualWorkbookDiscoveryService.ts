import * as fs from "node:fs";
import * as path from "node:path";

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
}
