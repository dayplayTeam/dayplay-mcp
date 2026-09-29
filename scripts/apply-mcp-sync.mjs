import { readFileSync, writeFileSync } from "node:fs";

const payloadPath = process.argv[2];
const payload = JSON.parse(readFileSync(payloadPath, "utf8"));

if (process.argv.includes("--stamp")) {
  const version = JSON.parse(readFileSync("package.json", "utf8")).version;
  const server = JSON.parse(readFileSync("server.json", "utf8"));
  server.version = version;
  writeFileSync("server.json", JSON.stringify(server, null, 2) + "\n");
  const smithery = readFileSync("smithery.yaml", "utf8").replace(/^version:.*$/m, `version: ${version}`);
  writeFileSync("smithery.yaml", smithery);
  const sync = JSON.parse(readFileSync("catalog-sync.json", "utf8"));
  sync.npmVersion = version;
  writeFileSync("catalog-sync.json", JSON.stringify(sync, null, 2) + "\n");
  console.log(version);
  process.exit(0);
}

let prev = { toolCount: payload.toolCount, fingerprint: "" };
try {
  prev = { ...prev, ...JSON.parse(readFileSync("catalog-sync.json", "utf8")) };
} catch {
  // First sync has no recorded fingerprint.
}
if (prev.fingerprint && prev.fingerprint === payload.fingerprint) {
  console.log("unchanged");
  process.exit(0);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.description = pkg.description.split(`${prev.toolCount}-tool`).join(`${payload.toolCount}-tool`);
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

const readme = readFileSync("README.md", "utf8").split(`${prev.toolCount}-tool`).join(`${payload.toolCount}-tool`);
writeFileSync("README.md", readme);

writeFileSync(
  "catalog-sync.json",
  JSON.stringify(
    {
      serverVersion: payload.serverVersion,
      toolCount: payload.toolCount,
      fingerprint: payload.fingerprint,
      npmVersion: pkg.version,
    },
    null,
    2,
  ) + "\n",
);
console.log("bump");
