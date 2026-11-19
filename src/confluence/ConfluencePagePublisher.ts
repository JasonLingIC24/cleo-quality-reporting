import * as fs from "node:fs";
import { marked } from "marked";
import { ConfluenceClient } from "./ConfluenceClient";

export class ConfluencePagePublisher {
  async publishMarkdown(title: string, markdownFile: string): Promise<void> {
    const markdown = fs.readFileSync(markdownFile, "utf8");

    const html = await marked.parse(markdown);

    const client = new ConfluenceClient();

    const page = await client.findPageByTitle(title);

    if (!page) {
      throw new Error(`Page not found: ${title}`);
    }

    await client.updatePage(page.id, page.title, page.version.number, html);
  }

  async publishHistoricalMarkdown(
    title: string,
    parentPageId: string,
    markdownFile: string,
  ): Promise<void> {
    const markdown = fs.readFileSync(markdownFile, "utf8");

    const html = await marked.parse(markdown);

    const client = new ConfluenceClient();

    const existing = await client.findPageByTitle(title);

    if (existing) {
      console.log(`Historical page already exists: ${title}`);

      return;
    }

    const parent = await client.findPageByTitle(
      "Nightly Failure Investigation",
    );

    if (!parent?.spaceId) {
      throw new Error("Could not determine Confluence spaceId");
    }

    await client.createPage(title, parentPageId, parent.spaceId, html);
  }
}
