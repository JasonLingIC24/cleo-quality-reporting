import "dotenv/config";

import { ConfluenceClient } from "../confluence/ConfluenceClient";

async function main() {
  const client = new ConfluenceClient();

  await client.testConnection();
}

main().catch(console.error);
