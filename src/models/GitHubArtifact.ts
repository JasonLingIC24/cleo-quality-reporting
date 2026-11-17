export interface GitHubArtifact {
  id: number;

  name: string;

  archive_download_url: string;

  expired?: boolean;
}
