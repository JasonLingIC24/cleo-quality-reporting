import * as fs from "node:fs";
import * as path from "node:path";

export function findScreenshots(
  rootPath: string,
  testCaseId: string,
): string[] {
  const matches: string[] = [];

  if (!fs.existsSync(rootPath)) {
    return matches;
  }

  walk(rootPath, testCaseId, matches);

  return matches;
}

function walk(
  currentPath: string,
  testCaseId: string,
  matches: string[],
): void {
  const items = fs.readdirSync(currentPath, {
    withFileTypes: true,
  });

  for (const item of items) {
    const fullPath = path.join(currentPath, item.name);

    if (item.isDirectory()) {
      walk(fullPath, testCaseId, matches);

      continue;
    }

    if (item.name.includes(`[${testCaseId}]`)) {
      matches.push(fullPath);
    }
  }
}
