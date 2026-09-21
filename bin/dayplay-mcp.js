#!/usr/bin/env node
/**
 * @dayplayai/mcp-server — DayPlay — SF Bay Area Local Intelligence MCP
 *
 * Zero-configuration stdio MCP proxy that bridges any stdio-only MCP client
 * (Cursor, Claude Desktop, Grok, Cline, etc.) to the hosted Dayplay remote
 * Streamable HTTP MCP endpoint.
 *
 *   npx -y @dayplayai/mcp-server
 *
 * All tool surface, schemas, and results are served by the remote endpoint, so
 * this package never needs updating when Dayplay ships new tools.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const DEFAULT_ENDPOINT = "https://www.dayplay.io/api/mcp";
const ENDPOINT = process.env.DAYPLAY_MCP_URL || DEFAULT_ENDPOINT;

const SERVER_INFO = {
  name: "dayplay",
  version: "1.3.1",
};

const log = (...args) => console.error("[dayplay-mcp]", ...args);

/** Build a connected remote client. */
async function connectRemote() {
  const client = new Client(
    { name: "dayplay-mcp-proxy", version: "1.3.1" },
    { capabilities: {} },
  );
  const transport = new StreamableHTTPClientTransport(new URL(ENDPOINT));
  await client.connect(transport);
  return client;
}

/** `--smoke`: verify the remote endpoint and exit non-zero on failure. */
async function smoke() {
  const client = await connectRemote();
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  log(`endpoint: ${ENDPOINT}`);
  log(`tools (${names.length}): ${names.join(", ")}`);
  await client.close();
  console.log(JSON.stringify({ ok: true, endpoint: ENDPOINT, tools: names }, null, 2));
  return names.length > 0;
}

async function main() {
  if (process.argv.includes("--smoke")) {
    const ok = await smoke();
    process.exit(ok ? 0 : 1);
  }

  const remote = await connectRemote();
  log(`proxying stdio -> ${ENDPOINT}`);

  const server = new Server(SERVER_INFO, {
    capabilities: { tools: {} },
  });

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const { tools } = await remote.listTools(
      request.params ?? undefined,
    );
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return remote.callTool({
      name: request.params.name,
      arguments: request.params.arguments ?? {},
    });
  });

  const shutdown = async () => {
    try {
      await server.close();
    } catch {}
    try {
      await remote.close();
    } catch {}
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const stdio = new StdioServerTransport();
  await server.connect(stdio);
  log("ready — Dayplay tools are live on stdio");
}

main().catch((error) => {
  log("fatal:", error?.stack || error?.message || String(error));
  process.exit(1);
});
