# DayPlay MCP — SF Bay Area Events, Places & Itineraries for AI Agents

**`@dayplayai/mcp-server`** · v2.0.0 · MIT

[![Run on Apify](https://img.shields.io/badge/Apify_Store-DayPlay%20Actor-orange?logo=apify)](https://apify.com/dayplay/dayplay-local-intelligence)

[![smithery badge](https://smithery.ai/badge/dayplayai/dayplay)](https://smithery.ai/servers/dayplayai/dayplay)

[![dayplayTeam/dayplay-mcp MCP server](https://glama.ai/mcp/servers/dayplayTeam/dayplay-mcp/badges/score.svg)](https://glama.ai/mcp/servers/dayplayTeam/dayplay-mcp)

[![Listed on mcpservers.org](https://mcpservers.org/badge.svg)](https://mcpservers.org/servers/dayplayteam/dayplay-mcp)

A zero-configuration MCP server that gives any AI agent a *locally grounded* concierge for the **San Francisco Bay Area only** — curated places, verified real-time events, and neighborhood binding that eliminates cross-bay drift.

> 🔒 **Scope: SF Bay Area only.** This server serves **strictly San Francisco, Oakland, and Berkeley — 35 neighborhood centroids**. It does **not** serve New York, Los Angeles, Chicago, Austin, Seattle, Miami, London, Tokyo, or any other city, region, or country. **Out-of-market locations are not served.** If a user asks about any location outside the SF Bay Area, the agent must state *"Dayplay is strictly San Francisco Bay Area only (San Francisco, Oakland, Berkeley); it does not cover \<location\>"* and must **not** call a tool or fabricate venues, events, dates, hours, or neighborhoods for that location. Zero results for a valid SF Bay Area query are reported honestly, never filled with invented places.

**Remote endpoint:** `https://api.dayplay.io/mcp` (Streamable HTTP / MCP)

---

## Quickstart

### Cursor

**Option A — direct remote server (recommended, no install).** Add to `~/.cursor/mcp.json` or this repo's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "dayplay": {
      "url": "https://api.dayplay.io/mcp"
    }
  }
}
```

**Option B — zero-config stdio proxy (works with any client):**

```json
{
  "mcpServers": {
    "dayplay": {
      "command": "npx",
      "args": ["-y", "@dayplayai/mcp-server"]
    }
  }
}
```

### Claude Desktop

Edit `claude_desktop_config.json`:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dayplay": {
      "command": "npx",
      "args": ["-y", "@dayplayai/mcp-server"]
    }
  }
}
```

Restart Claude Desktop, then ask: *"What's happening in the Mission tonight?"*

### Grok Bot

Add the Dayplay remote connector:

```
https://api.dayplay.io/mcp
```

Or bridge it over stdio in Grok's MCP config:

```json
{
  "mcpServers": {
    "dayplay": {
      "command": "npx",
      "args": ["-y", "@dayplayai/mcp-server"]
    }
  }
}
```

Pair it with the [`vibe-scout` skill](skills/vibe-scout/SKILL.md) for prompt-level scope enforcement.

### Terminal smoke test

```bash
npx -y @dayplayai/mcp-server --smoke
```

Prints the live endpoint and available tool names. Exits non-zero on failure.

---

## Tools

The catalog covers the SF Bay Area (San Francisco, Oakland, Berkeley — 35 centroids). Out-of-market locations are declined, never fabricated.

**Open tools** run immediately — no account needed. **Gated tools** return `401` on first call. The remote URL and `npx -y @dayplayai/mcp-server` both serve this same 40-tool catalog, and the npm bridge opens Google sign-in for gated tools.

### Discovery (open)

- `get_happening_today` — events + places happening today, by location and radius
- `get_live_now` — what is happening right now
- `get_weekend` — Saturday/Sunday feed (`weekend_day: "sat" | "sun"`)
- `get_decision_feed` — ranked decision feed (send `user_lat` / `user_lng`)
- `browse_places` — places inside a radius, sorted by distance
- `get_listing` — full detail for one place or venue by `id`
- `get_top_restaurants` / `get_top_venues` — ranked lists, optional city
- `get_local_gems` — curated local gems
- `get_locals_favorites` — locals' favorites
- `get_venue_events` — upcoming events at one venue (`id`)
- `get_subcategories` / `get_genres` / `get_event_bridge` — taxonomy feeds

### Marketing feeds (open, X-API-Key)

- `get_marketing_events` / `get_marketing_places` / `get_marketing_neighborhoods` — catalog feeds; forward an `X-API-Key` header. `get_marketing_neighborhoods` returns the **35 SF Bay Area neighborhood centroids with coordinates and radii**.

### Search 🔒 *free account*

- `search_smart`, `search_query_router`, `search_embed`, `search_parse_intent`, `search_rerank`, `search_web` — model-backed semantic search. Requires the user token via Google connect.

### Saves & Outings 🔒 *free account*

- `save_outing` — save a dated, neighborhood-bound outing plan to the signed-in user's Saved tab
- `get_my_itinerary` — retrieve the signed-in user's saved itineraries
- `list_saves`, `save_listing`, `unsave_listing`, `list_going`, `mark_going`, `unmark_going`, `get_profile` — saved places, event RSVPs, and the signed-in profile
- `upvote_listing`, `share_local_favorite`, `share_gem` — community signals

Requires the free-account connect. A host connected to the remote URL opens Google sign-in on the first gated call; the npm stdio package opens a browser for the same connect step. Saved plans appear on the DayPlay Saved tab across web and app.

Requires the free-account connect (`https://www.dayplay.io/link`). Saved plans appear on the DayPlay Saved tab across web and app.

Example prompts: *"What's happening in the Mission tonight?"* · *"Build me a Saturday itinerary that never leaves Bernal Heights."* · *"Save this outing to my DayPlay account."*

### Legacy compatibility

The original five names are part of the 40-tool catalog: `get_neighborhoods`, `get_events`, and `get_places` are open. `plan_outing` and `manage_saved_plans` need Google connect. `plan_outing` applies a comma-separated `interests` value as the catalog category filter.

## The Anti-Drift Guarantee

Most local AI answers fail the same way: a "Mission" recommendation lands in Oakland, a "Berkeley" event is actually in San Jose, and a walking itinerary silently requires a bridge crossing.

**Scope:** SF Bay Area only (San Francisco, Oakland, Berkeley). No national or global coverage.

**Dayplay receipts:**

- **Spatially verified.** Every place and event result is validated against neighborhood centroid coordinates and radii pulled live from `get_neighborhoods` (35 Bay Area neighborhoods).
- **Neighborhood-bound queries.** `neighborhood` is an exact-match binding parameter, not a fuzzy keyword hint — results outside the bound radius are dropped, not ranked down.
- **Zero cross-bay drift.** No Oakland result in a San Francisco query. No Marin result in an East Bay query. No bridge-crossing itinerary that claims to be walkable.
- **Real-time, not stale.** `get_events` queries verified occurrences by `date`, so "tonight" means tonight — not an SEO page from last season.
- **Out-of-market refusal.** Non-Bay-Area market names are refused before any upstream call, and the surfaced copy states the SF-Bay-Area-only boundary rather than returning plausible-but-wrong geography.
- **Honest emptiness.** If a bounded query has no verified matches, it returns nothing rather than padding with invented places.

That is the product: the answer stays where you are.

---

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `DAYPLAY_MCP_URL` | `https://api.dayplay.io/mcp` | Override the remote endpoint (staging, self-hosted, local dev) |

No API key is required for the public endpoint. Optional auth tokens, if your deployment needs them, are passed through as standard `Authorization` headers by the MCP client — never commit them to config files.

---

## How the proxy works

```
MCP client (stdio)  ⇄  bin/dayplay-mcp.js  ⇄  https://api.dayplay.io/mcp (Streamable HTTP)
```

The shim lists tools and forwards `tools/call` verbatim to the remote endpoint, so new Dayplay tools appear automatically without an npm update. It is a transport bridge, not a reimplementation — every schema, filter, and verification rule is served by Dayplay itself.

Prefer direct HTTP if your client supports it; use the shim for stdio-only clients.

---

## Repository layout

```
dayplay-mcp/
├── .cursor/
│   └── mcp.json              # Direct Cursor MCP connection
├── .cursor-plugin/
│   └── plugin.json           # Cursor Marketplace catalog plugin manifest
├── skills/
│   └── vibe-scout/
│       └── SKILL.md          # Grok Bot & Cursor Agent prompt instructions
├── bin/
│   └── dayplay-mcp.js        # Executable proxy for `npx -y @dayplayai/mcp-server`
├── assets/
│   └── logo.svg
├── test/
│   └── e2e.mjs
├── smithery.yaml             # Smithery.ai registry manifest
├── plugin.json               # Agent Plugins standard manifest
├── package.json              # npm metadata (@dayplayai/mcp-server v1.3.4, MIT)
├── README.md                 # This file
└── LICENSE                   # MIT (Dayplay Team)
```

---

## Development

```bash
node bin/dayplay-mcp.js --smoke   # verify remote endpoint + tool discovery
node bin/dayplay-mcp.js           # run the stdio proxy
node test/e2e.mjs                 # end-to-end stdio smoke (tools + 3 tool calls)
```

---

## Releasing (maintainers)

Publishing is fully automated via **npm Trusted Publishing (OIDC)** — no `NPM_TOKEN`, no 2FA prompts. The `.github/workflows/publish.yml` workflow is bound in the package's npm settings to this exact repo + workflow.

```bash
npm version patch        # or minor / major — bumps package.json, creates the vX.Y.Z tag
git push --follow-tags
```

CI then: verifies `package.json` version matches the tag → `npm ci` → smoke test → `npm publish --provenance` (sigstore-signed, OIDC-attested).

**Gotcha:** `--follow-tags` doesn't always push the tag. If no workflow run appears under *Actions* within a minute, finish with:

```bash
git push origin v1.X.Y
```

Notes:

- The registry shows *"package is being processed"* for ~3 minutes after publish before the new version resolves — don't panic-verify too early.
- npm's OIDC flow requires **npm ≥ 11.5.1** in CI; the workflow installs `npm@latest` for this reason.
- If the workflow ever gains an `environment:` block, the npm Trusted Publisher binding must be updated to the same environment name, or publishes will be rejected.

---

## License

MIT © Dayplay Team — https://www.dayplay.io
