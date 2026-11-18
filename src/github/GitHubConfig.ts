export class GitHubConfig {
  static readonly owner = process.env.GITHUB_OWNER!;

  static readonly repo = process.env.GITHUB_REPO!;

  static readonly token = process.env.GITHUB_TOKEN!;

  static readonly nightlyWorkflowId =
    process.env.GITHUB_NIGHTLY_WORKFLOW ?? "call_test-cypress.yml";
}
