import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const AUTH_PATH = path.join(os.homedir(), ".dayplay", "mcp-auth.json");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(AUTH_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(AUTH_PATH), { recursive: true });
  fs.writeFileSync(AUTH_PATH, JSON.stringify(state), { mode: 0o600 });
}

function openBrowser(target) {
  const url = String(target);
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  const command = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(command, [url], { detached: true, stdio: "ignore" }).unref();
}

export async function createAuthProvider(endpoint, log) {
  const origin = new URL(endpoint).origin;
  let state = readState();
  let waitForCode = () => Promise.reject(new Error("Dayplay connect is not waiting"));

  const callback = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname !== "/callback") {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<p>Dayplay is connected. You can close this tab.</p>");
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    waitForCode(code, error);
  });
  await new Promise((resolve, reject) => {
    callback.once("error", reject);
    callback.listen(0, "127.0.0.1", resolve);
  });
  const { port } = callback.address();
  const redirectUrl = `http://127.0.0.1:${port}/callback`;

  return {
    get redirectUrl() {
      return redirectUrl;
    },
    get clientMetadata() {
      return {
        client_name: "Dayplay MCP",
        redirect_uris: [redirectUrl],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      };
    },
    clientInformation() {
      return state.client;
    },
    saveClientInformation(client) {
      state = { ...state, client };
      writeState(state);
    },
    tokens() {
      return state.tokens;
    },
    saveTokens(tokens) {
      state = { ...state, tokens };
      writeState(state);
    },
    saveCodeVerifier(verifier) {
      state = { ...state, verifier };
      writeState(state);
    },
    codeVerifier() {
      if (!state.verifier) {
        throw new Error("Dayplay connect is missing its PKCE verifier");
      }
      return state.verifier;
    },
    async redirectToAuthorization(authorizationUrl) {
      log("Opening a browser to connect Dayplay. Sign in with Google, then retry the tool if it does not finish.");
      const code = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Dayplay connect timed out. Sign in with Google and call the tool again."));
        }, 3 * 60 * 1000);
        waitForCode = (nextCode, error) => {
          clearTimeout(timer);
          if (error || !nextCode) {
            reject(new Error(error || "Dayplay connect did not return a code"));
            return;
          }
          resolve(nextCode);
        };
        openBrowser(authorizationUrl);
      });
      const clientId = state.client?.client_id;
      if (!clientId) {
        throw new Error("Dayplay connect is missing its client id");
      }
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: state.verifier,
        redirect_uri: redirectUrl,
        client_id: clientId,
      });
      const response = await fetch(`${origin}/oauth/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) {
        throw new Error("Dayplay connect could not finish sign-in");
      }
      state = { ...state, tokens: await response.json() };
      writeState(state);
    },
  };
}
