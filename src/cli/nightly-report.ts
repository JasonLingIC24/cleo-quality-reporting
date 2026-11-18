import "dotenv/config";

import { GitHubConfig } from "../github/GitHubConfig";
import { GitHubArtifactDownloader } from "../github/GitHubArtifactDownloader";
import { ArtifactExtractor } from "../github/ArtifactExtractor";

import { ArtifactDiscoveryService } from "../services/ArtifactDiscoveryService";
import { ArtifactPaths } from "../services/ArtifactPaths";

import { MochawesomeParser } from "../parsers/mochawesome/MochawesomeParser";

import { FailureInvestigationReportGenerator } from "../reports/failure-investigation/FailureInvestigationReportGenerator";

async function main() {
  //
  // Download Nightly Artifacts
  //
  const downloader = new GitHubArtifactDownloader();

  const runId = process.env.NIGHTLY_RUN_ID!;

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

  //
  // Generate Failure Report
  //
  const generator = new FailureInvestigationReportGenerator();

  await generator.generate(testRun);

  console.log("Failure investigation report generated");
}

main().catch(console.error);
