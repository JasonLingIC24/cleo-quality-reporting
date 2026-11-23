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

  async downloadArtifactsForWorkflow(workflowFile: string): Promise<string> {
    const runId = await this.getLatestWorkflowRun(workflowFile);

    if (this.isRunCached(runId)) {
      console.log(`Using cached artifacts for run ${runId}`);

      return this.getRunDirectory(runId);
    }

    console.log(`Using workflow ${workflowFile}`);

    const artifacts = await this.listArtifacts(runId);

    for (const artifact of artifacts) {
      await this.downloadArtifact(runId, artifact);
    }

    return this.getRunDirectory(runId);
  }

  async downloadArtifactsForRun(runId: string): Promise<string> {
    if (this.isRunCached(runId)) {
      console.log(`Using cached artifacts for run ${runId}`);

      return this.getRunDirectory(runId);
    }

    const artifacts = await this.listArtifacts(runId);

    for (const artifact of artifacts) {
      await this.downloadArtifact(runId, artifact);
    }

    return this.getRunDirectory(runId);
  }

  private async getLatestWorkflowRun(workflowFile: string): Promise<string> {
    console.log(`Querying workflow ${workflowFile}`);

    const response = await fetch(
      `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/actions/workflows/${workflowFile}/runs?status=success&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${GitHubConfig.token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to find workflow runs: ${response.status}`);
    }

    const payload = await response.json();
    console.log(`Total runs returned: ${payload.total_count}`);

    for (const run of payload.workflow_runs ?? []) {
      console.log(
        [run.id, run.name, run.status, run.conclusion, run.created_at].join(
          " | ",
        ),
      );
    }

    const run = payload.workflow_runs?.[0];

    if (!run) {
      throw new Error(`No successful runs found for ${workflowFile}`);
    }

    console.log(`Latest workflow run: ${run.id}`);

    return String(run.id);
  }

  async listWorkflows(): Promise<void> {
    const response = await fetch(
      `https://api.github.com/repos/${GitHubConfig.owner}/${GitHubConfig.repo}/actions/workflows`,
      {
        headers: {
          Authorization: `Bearer ${GitHubConfig.token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    const payload = await response.json();

    for (const workflow of payload.workflows) {
      console.log(workflow.id, workflow.name, workflow.path);
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
