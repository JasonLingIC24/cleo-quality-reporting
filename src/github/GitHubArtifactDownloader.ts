import * as fs from "node:fs";
import * as path from "node:path";

import { Octokit } from "@octokit/rest";

export class GitHubArtifactDownloader {
  constructor(private readonly token: string) {}

  async downloadLatestRunArtifacts(
    owner: string,
    repo: string,
    outputDirectory: string,
  ): Promise<void> {
    const octokit = new Octokit({
      auth: this.token,
    });

    const runs = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 20,
    });

    const latestRun = runs.data.workflow_runs.find(
      (run) => run.name === "Manual Full Test Suite",
    );

    if (!latestRun) {
      throw new Error("Could not find Manual Full Test Suite run");
    }

    console.log(`Using workflow run ${latestRun.id}`);

    const artifacts = await octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: latestRun.id,
    });

    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    for (const artifact of artifacts.data.artifacts) {
      const extractDirectory = path.join(outputDirectory, artifact.name);

      if (fs.existsSync(extractDirectory)) {
        console.log(`Skipping ${artifact.name} (already downloaded)`);

        continue;
      }

      console.log(`Downloading ${artifact.name}`);

      const zip = await octokit.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: artifact.id,
        archive_format: "zip",
      });

      const zipPath = path.join(outputDirectory, `${artifact.name}.zip`);

      fs.writeFileSync(zipPath, Buffer.from(zip.data as ArrayBuffer));
    }
  }
}
