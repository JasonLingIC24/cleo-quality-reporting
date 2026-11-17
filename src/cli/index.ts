import "dotenv/config";

import { MochawesomeParser } from "../parsers/mochawesome/MochawesomeParser";
import { ArtifactDiscoveryService } from "../services/ArtifactDiscoveryService";
import { ArtifactPaths } from "../services/ArtifactPaths";
import { ArtifactExtractor } from "../github/ArtifactExtractor";
import { BackendUnitAdapter } from "../parsers/backend-unit/BackendUnitAdapter";
import { BackendIntegrationAdapter } from "../parsers/backend-integration/BackendIntegrationAdapter";
import { FrontendCoverageAdapter } from "../parsers/frontend/FrontendCoverageAdapter";
import { QualityReportFactory } from "../factories/QualityReportFactory";
import { ManagementReportGenerator } from "../reports/management/ManagementReportGenerator";
import { ManualWorkbookDiscoveryService } from "../services/ManualWorkbookDiscoveryService";
import { ManualRegressionWorkbookAdapter } from "../parsers/manual-regression/ManualRegressionWorkbookAdapter";
import { ReleaseTestPlanAdapter } from "../adapters/ReleaseTestPlanAdapter";
import { GitHubArtifactDownloader } from "../github/GitHubArtifactDownloader";
import { TestPlanProgressCalculator } from "../services/TestPlanProgressCalculator";

async function main() {
  //
  // Load Release Test Plan
  //

  const releaseTestPlan = ReleaseTestPlanAdapter.load(
    "./release-plans/release-test-plan-v26.23.1.json",
  );

  console.log("Release Test Plan");

  console.log(JSON.stringify(releaseTestPlan, null, 2));

  //
  // Download GitHub Artifacts
  //

  const downloader = new GitHubArtifactDownloader();

  await downloader.downloadArtifactsForRelease(releaseTestPlan);

  //
  // Determine the run cache directory
  //

  const runDirectory = downloader.getCurrentRunDirectory(releaseTestPlan);

  //
  // Extract artifacts for this run
  //

  new ArtifactExtractor().extract(runDirectory);

  //
  // Discover extracted artifacts
  //

  const artifacts = ArtifactDiscoveryService.findForRun(runDirectory);

  //
  // Parse Cypress Results
  //

  const parser = new MochawesomeParser();

  const run = await parser.parse(
    ArtifactPaths.mochawesome(artifacts),
    "./artifacts/screenshots",
  );

  //
  // Parse Backend Results
  //

  const backendUnit = new BackendUnitAdapter().parse(artifacts.backendUnitPath);

  const backendIntegration = new BackendIntegrationAdapter().parse(
    artifacts.backendIntegrationPath,
  );

  //
  // Parse Frontend Coverage
  //

  const frontendCoverage = new FrontendCoverageAdapter().parse(
    artifacts.frontendPath,
  );

  //
  // Parse Manual Regression Workbooks
  //

  const workbookPaths = ManualWorkbookDiscoveryService.findAll();

  const manualAdapter = new ManualRegressionWorkbookAdapter();

  const manualRegression = await Promise.all(
    workbookPaths.map((path) => manualAdapter.parse(path)),
  );

  //
  // Calculate Test Plan Progress
  //

  const testPlanProgress = TestPlanProgressCalculator.calculate(
    releaseTestPlan,
    manualRegression,
  );

  console.log("Test Plan Progress");

  console.log(JSON.stringify(testPlanProgress, null, 2));

  //
  // Build Quality Report
  //

  const qualityReport = QualityReportFactory.create(
    run,
    backendUnit,
    backendIntegration,
    frontendCoverage,
    manualRegression,
    releaseTestPlan,
    testPlanProgress,
  );

  //
  // Generate Management Report
  //

  const managementGenerator = new ManagementReportGenerator();

  const reportDate = new Date(process.env.REPORT_DATE ?? Date.now());

  await managementGenerator.generate(qualityReport, reportDate);
}

main().catch(console.error);
