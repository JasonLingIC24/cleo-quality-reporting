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

async function main() {
  new ArtifactExtractor().extract();

  const artifacts = ArtifactDiscoveryService.findLatest();

  console.log(artifacts);

  const parser = new MochawesomeParser();

  const run = await parser.parse(
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

  const workbookPaths = ManualWorkbookDiscoveryService.findAll();

  const manualAdapter = new ManualRegressionWorkbookAdapter();

  const manualRegression = await Promise.all(
    workbookPaths.map((path) => manualAdapter.parse(path)),
  );

  const qualityReport = QualityReportFactory.create(
    run,
    backendUnit,
    backendIntegration,
    frontendCoverage,
    manualRegression,
  );

  console.log("Release Assessment");

  console.log(JSON.stringify(qualityReport.assessment, null, 2));

  const managementGenerator = new ManagementReportGenerator();

  const reportDate = new Date(process.env.REPORT_DATE ?? Date.now());

  await managementGenerator.generate(qualityReport, reportDate);
}

main().catch(console.error);
