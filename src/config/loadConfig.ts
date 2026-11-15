import { ReportingConfig } from "./ReportingConfig";

export function loadConfig(): ReportingConfig {
  return {
    githubToken: process.env.GITHUB_TOKEN ?? "",

    owner: process.env.GITHUB_OWNER ?? "eva-healthtech",

    repo: process.env.GITHUB_REPO ?? "elevate-monorepo",

    workflowName: process.env.GITHUB_WORKFLOW ?? "Manual Full Test Suite",

    downloadDirectory: process.env.ARTIFACT_DIR ?? "./artifacts",
  };
}
