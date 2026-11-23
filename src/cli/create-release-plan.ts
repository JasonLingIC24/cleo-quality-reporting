import * as fs from "node:fs";
import * as path from "node:path";

function getReleaseVersion(): string {
  const version = process.argv[2];

  if (!version) {
    throw new Error("Usage: npm run create-release-plan -- v26.24.0");
  }

  return version;
}

function findLatestReleasePlan(): string {
  const releasePlansDir = "./release-plans";

  const plans = fs
    .readdirSync(releasePlansDir)
    .filter(
      (file) => file.startsWith("release-test-plan-") && file.endsWith(".json"),
    )
    .sort();

  if (plans.length === 0) {
    throw new Error("No existing release plans found");
  }

  return path.join(releasePlansDir, plans[plans.length - 1]);
}

function main(): void {
  const releaseVersion = getReleaseVersion();

  const sourcePlan = findLatestReleasePlan();

  const outputPlan = path.join(
    "./release-plans",
    `release-test-plan-${releaseVersion}.json`,
  );

  if (fs.existsSync(outputPlan)) {
    throw new Error(`Release plan already exists: ${outputPlan}`);
  }

  const releasePlan = JSON.parse(fs.readFileSync(sourcePlan, "utf8"));

  releasePlan.releaseVersion = releaseVersion;

  releasePlan.githubRunId = "";

  releasePlan.releaseDate = "";

  fs.writeFileSync(
    outputPlan,
    `${JSON.stringify(releasePlan, null, 2)}\n`,
    "utf8",
  );

  console.log(`Created ${outputPlan} from ${path.basename(sourcePlan)}`);
}

main();
