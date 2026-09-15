import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const t = new StdioClientTransport({ command: "node", args: ["bin/dayplay-mcp.js"], cwd: process.cwd() });
const c = new Client({ name: "e2e", version: "1.0.0" }, { capabilities: {} });
await c.connect(t);

const { tools } = await c.listTools();
console.log("TOOLS:", tools.map(x => x.name).join(", "));

const nb = await c.callTool({ name: "get_neighborhoods", arguments: {} });
const txt = nb.content?.[0]?.text ?? "";
console.log("get_neighborhoods chars:", txt.length, "| isError:", nb.isError ?? false);

const ev = await c.callTool({ name: "get_events", arguments: { neighborhood: "Mission", limit: 2 } });
console.log("get_events ok | isError:", ev.isError ?? false, "| sample:", (ev.content?.[0]?.text ?? "").slice(0, 180).replace(/\n/g, " "));

const pl = await c.callTool({ name: "get_places", arguments: { neighborhood: "North Beach", limit: 2 } });
console.log("get_places ok | isError:", pl.isError ?? false, "| sample:", (pl.content?.[0]?.text ?? "").slice(0, 180).replace(/\n/g, " "));

await c.close();
process.exit(0);
