import { GitHubArtifact } from "../../models/GitHubArtifact";

export interface GitHubArtifactsResponse {
  total_count: number;

  artifacts: GitHubArtifact[];
}
