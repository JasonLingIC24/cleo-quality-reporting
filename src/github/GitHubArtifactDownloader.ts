import * as fs from "node:fs";
import * as path from "node:path";
import { GitHubConfig } from "./GitHubConfig";
import { ReleaseTestPlan } from "../models/ReleaseTestPlan";
import { GitHubArtifact } from "../models/GitHubArtifact";
import { GitHubArtifactsResponse } from "./models/GitHubArtifactsResponse";

export class GitHubArtifactDownloader {
  async downloadArtifactsForRelease(
    releaseTestPlan: ReleaseTestPlan,
  ): Promise<void> {
    const runId = releaseTestPlan.githubRunId;

    if (this.isRunCached(runId)) {
      console.log(`Using cached artifacts for run ${runId}`);

      return;
    }

    console.log(`Release Version: ${releaseTestPlan.releaseVersion}`);

    const artifacts = await this.listArtifacts(releaseTestPlan.githubRunId);

    for (const artifact of artifacts) {
      await this.downloadArtifact(releaseTestPlan.githubRunId, artifact);
    }
  }

  private async listArtifacts(runId: string): Promise<GitHubArtifact[]> {
    const response = await fetch(
      `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/actions/runs/${runId}/artifacts`,
      {
        headers: {
          Authorization: `Bearer ${GitHubConfig.token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to list artifacts: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as GitHubArtifactsResponse;

    console.log(`Found ${payload.total_count} artifact(s)`);

    for (const artifact of payload.artifacts) {
      console.log(`- ${artifact.name}`);
    }

    return payload.artifacts;
  }

  private async downloadArtifact(
    runId: string,
    artifact: GitHubArtifact,
  ): Promise<void> {
    console.log(`Downloading ${artifact.name}`);

    const response = await fetch(artifact.archive_download_url, {
      headers: {
        Authorization: `Bearer ${GitHubConfig.token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download ${artifact.name}: ${response.status}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    fs.mkdirSync("./artifacts", {
      recursive: true,
    });

    const fileName = `${artifact.name}.zip`;

    const runDirectory = this.getRunDirectory(runId);

    fs.mkdirSync(runDirectory, {
      recursive: true,
    });

    const filePath = path.join(runDirectory, fileName);

    fs.writeFileSync(filePath, buffer);

    console.log(`Saved ${filePath}`);
  }

  private getRunDirectory(runId: string): string {
    return path.join("./artifacts/runs", runId);
  }

  private isRunCached(runId: string): boolean {
    return fs.existsSync(
      path.join(
        this.getRunDirectory(runId),
        "extracted",
        "cypress",
        "mochawesome.json",
      ),
    );
  }

  getCurrentRunDirectory(releaseTestPlan: ReleaseTestPlan): string {
    return this.getRunDirectory(releaseTestPlan.githubRunId);
  }
}
