export class ConfluenceConfig {
  static readonly baseUrl = process.env.CONFLUENCE_BASE_URL!;

  static readonly email = process.env.CONFLUENCE_EMAIL!;

  static readonly apiToken = process.env.CONFLUENCE_API_TOKEN!;

  static readonly spaceKey = process.env.CONFLUENCE_SPACE_KEY!;
}
