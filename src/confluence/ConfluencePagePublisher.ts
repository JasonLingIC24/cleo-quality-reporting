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
}
