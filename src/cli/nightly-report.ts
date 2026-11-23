import "dotenv/config";
import { getRunId } from "./getRunId";
import { GitHubArtifactDownloader } from "../github/GitHubArtifactDownloader";
import { ArtifactExtractor } from "../github/ArtifactExtractor";
import { ArtifactDiscoveryService } from "../services/ArtifactDiscoveryService";
import { ArtifactPaths } from "../services/ArtifactPaths";
import { MochawesomeParser } from "../parsers/mochawesome/MochawesomeParser";
import { FailureInvestigationReportGenerator } from "../reports/failure-investigation/FailureInvestigationReportGenerator";
import { ConfluencePagePublisher } from "../confluence/ConfluencePagePublisher";
import { ConfluencePageIds } from "../confluence/ConfluencePageIds";
import { NightlyHealthSummary } from "../reports/failure-investigation/models/NightlyHealthSummary";
import { BackendUnitAdapter } from "../parsers/backend-unit/BackendUnitAdapter";
import { BackendIntegrationAdapter } from "../parsers/backend-integration/BackendIntegrationAdapter";
import { FrontendCoverageAdapter } from "../parsers/frontend/FrontendCoverageAdapter";

async function main() {
  //
  // Download Nightly Artifacts
  //

  const runId = getRunId();

  const downloader = new GitHubArtifactDownloader();

  const runDirectory = await downloader.downloadArtifactsForRun(runId);

  //
  // Extract artifacts
  //
  new ArtifactExtractor().extract(runDirectory);

  //
  // Discover artifacts
  //
  const artifacts = ArtifactDiscoveryService.findForRun(runDirectory);

  //
  // Parse Cypress Results
  //
  const parser = new MochawesomeParser();

  const testRun = await parser.parse(
    ArtifactPaths.mochawesome(artifacts),
    "./artifacts/screenshots",
  );

  const backendUnit = new BackendUnitAdapter().parse(artifacts.backendUnitPath);

  const backendIntegration = new BackendIntegrationAdapter().parse(
    artifacts.backendIntegrationPath,
  );

  const frontendCoverage = new FrontendCoverageAdapter().parse(
    artifacts.frontendPath,
  );

  const healthSummary: NightlyHealthSummary = {
    cypress: {
      total: testRun.totalTests,
      passed: testRun.passed,
      failed: testRun.failed,
      skipped: testRun.skipped,
    },

    backendUnit: {
      total: backendUnit.total,
      passed: backendUnit.passed,
      failed: backendUnit.failed,
      skipped: backendUnit.skipped,
    },

    backendIntegration: {
      total: backendIntegration.total,
      passed: backendIntegration.passed,
      failed: backendIntegration.failed,
      skipped: backendIntegration.skipped,
    },

    frontendCoverage: {
      lines: frontendCoverage.lines,
      statements: frontendCoverage.statements,
      functions: frontendCoverage.functions,
      branches: frontendCoverage.branches,
    },
  };

  //
  // Generate Failure Report
  //
  const generator = new FailureInvestigationReportGenerator();

  await generator.generate(testRun, healthSummary);

  console.log("Failure investigation report generated");

  const publisher = new ConfluencePagePublisher();

  await publisher.publishMarkdown(
    "Nightly Failure Investigation",
    "./reports/failure-investigation/index.md",
  );

  await publisher.publishHistoricalMarkdown(
    `Nightly Failure Investigation - ${new Date().toISOString().slice(0, 10)}`,
    ConfluencePageIds.nightlyParentPageId,
    "./reports/failure-investigation/index.md",
  );
}

main().catch(console.error);
