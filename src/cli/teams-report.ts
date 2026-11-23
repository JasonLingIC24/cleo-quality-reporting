import "dotenv/config";

import { getRunId } from "./getRunId";

import { GitHubArtifactDownloader } from "../github/GitHubArtifactDownloader";
import { ArtifactExtractor } from "../github/ArtifactExtractor";

import { ArtifactDiscoveryService } from "../services/ArtifactDiscoveryService";

import { MochawesomeParser } from "../parsers/mochawesome/MochawesomeParser";
import { BackendUnitAdapter } from "../parsers/backend-unit/BackendUnitAdapter";
import { BackendIntegrationAdapter } from "../parsers/backend-integration/BackendIntegrationAdapter";
import { FrontendCoverageAdapter } from "../parsers/frontend/FrontendCoverageAdapter";

import { ArtifactPaths } from "../services/ArtifactPaths";

import { QualityReportFactory } from "../factories/QualityReportFactory";

import { TeamsSummaryGenerator } from "../reports/teams/TeamsSummaryGenerator";

async function main() {
  //
  // Download Artifacts
  //

  const runId = getRunId();

  const downloader = new GitHubArtifactDownloader();

  const runDirectory = await downloader.downloadArtifactsForRun(runId);

  //
  // Extract Artifacts
  //

  new ArtifactExtractor().extract(runDirectory);

  //
  // Discover Artifacts
  //

  const artifacts = ArtifactDiscoveryService.findForRun(runDirectory);

  //
  // Parse Cypress Results
  //

  const cypress = await new MochawesomeParser().parse(
    ArtifactPaths.mochawesome(artifacts),
    "./artifacts/screenshots",
  );

  //
  // Parse Backend Unit Results
  //

  const backendUnit = new BackendUnitAdapter().parse(artifacts.backendUnitPath);

  //
  // Parse Backend Integration Results
  //

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
  // Build Quality Report
  //

  const report = QualityReportFactory.create(
    cypress,
    backendUnit,
    backendIntegration,
    frontendCoverage,
  );

  //
  // Generate Teams Summary
  //

  const generator = new TeamsSummaryGenerator();

  await generator.generate(report);

  console.log("Teams summary generated");
}

main().catch(console.error);
