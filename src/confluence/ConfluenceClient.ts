import { ConfluenceConfig } from "./ConfluenceConfig";
import { ConfluencePage } from "./models/ConfluencePage";

export class ConfluenceClient {
  private buildHeaders(): HeadersInit {
    const auth = Buffer.from(
      `${ConfluenceConfig.email}:${ConfluenceConfig.apiToken}`,
    ).toString("base64");

    return {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  async testConnection(): Promise<void> {
    const response = await fetch(
      `${ConfluenceConfig.baseUrl}/wiki/api/v2/spaces`,
      {
        headers: this.buildHeaders(),
      },
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        [
          `Confluence connection failed`,
          `Status: ${response.status}`,
          body,
        ].join("\n"),
      );
    }

    console.log("Connected to Confluence");
  }
  async findPageByTitle(title: string): Promise<ConfluencePage | undefined> {
    const encodedTitle = encodeURIComponent(title);

    const response = await fetch(
      `${ConfluenceConfig.baseUrl}/wiki/api/v2/pages?title=${encodedTitle}`,
      {
        headers: this.buildHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to find page: ${response.status}`);
    }

    const payload = await response.json();

    const page = payload.results?.[0];

    if (!page) {
      return undefined;
    }

    return {
      id: page.id,
      title: page.title,
      spaceId: page.spaceId,
      version: {
        number: page.version?.number ?? 1,
      },
    };
  }

  async updatePage(
    pageId: string,
    title: string,
    version: number,
    content: string,
  ): Promise<void> {
    const response = await fetch(
      `${ConfluenceConfig.baseUrl}/wiki/api/v2/pages/${pageId}`,
      {
        method: "PUT",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          id: pageId,
          status: "current",
          title,
          version: {
            number: version + 1,
          },
          body: {
            representation: "storage",
            value: content,
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        [`Failed to update page`, `Status: ${response.status}`, body].join(
          "\n",
        ),
      );
    }

    console.log(`Updated Confluence page: ${title}`);
  }

  async createPage(
    title: string,
    parentPageId: string,
    spaceId: string,
    content: string,
  ): Promise<void> {
    const response = await fetch(
      `${ConfluenceConfig.baseUrl}/wiki/api/v2/pages`,
      {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({
          title,
          parentId: parentPageId,
          spaceId,
          status: "current",
          body: {
            representation: "storage",
            value: content,
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        ["Failed to create page", `Status: ${response.status}`, body].join(
          "\n",
        ),
      );
    }

    console.log(`Created page: ${title}`);
  }
}
