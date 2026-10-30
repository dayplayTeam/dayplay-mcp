# Dayplay MCP — Verified Real-Time Physical Intelligence for Major Metros Nationwide

**`@dayplayai/mcp-server`** · v2.2.2 · MIT

Dayplay gives AI agents verified real-time physical intelligence — places, events, and walkable itineraries — across **major metros nationwide**. The **SF Bay Area is our flagship live market**, with **additional major metros rolling out next**.

[![Run on Apify](https://img.shields.io/badge/Apify_Store-Dayplay%20Actor-orange?logo=apify)](https://apify.com/dayplay/dayplay-local-intelligence)

[![smithery badge](https://smithery.ai/badge/dayplayai/dayplay)](https://smithery.ai/servers/dayplayai/dayplay)

[![dayplayTeam/dayplay-mcp MCP server](https://glama.ai/mcp/servers/dayplayTeam/dayplay-mcp/badges/score.svg)](https://glama.ai/mcp/servers/dayplayTeam/dayplay-mcp)

[![Listed on mcpservers.org](https://mcpservers.org/badge.svg)](https://mcpservers.org/servers/dayplayteam/dayplay-mcp)

A zero-configuration MCP server that gives any AI agent a *locally grounded* concierge across **major metros nationwide** — curated places, verified real-time events, and neighborhood binding that eliminates cross-metro and cross-bay drift. The **SF Bay Area is the flagship live market**, with **additional major metros rolling out next**.

> 🔒 **Coverage: nationwide posture, verified per request.** Dayplay covers **major metros nationwide**, with the **SF Bay Area as the flagship live market** (San Francisco, Oakland, and Berkeley — 35 neighborhood centroids) and **additional major metros rolling out next**. Live inventory is **not** uniform across every metro yet, so the rule is simple: **call the coverage tools first and trust what they return.** If a location comes back as not-yet-live or out of market, the agent must say so plainly — *"Dayplay doesn't have live coverage for \<location\> yet"* — and must **not** fabricate venues, events, dates, hours, or neighborhoods for it. Zero results for a covered query are reported honestly, never filled with invented places. This per-request check is what keeps the nationwide posture truthful.

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

The catalog spans **major metros nationwide**, with the SF Bay Area as the flagship live market (San Francisco, Oakland, Berkeley — 35 centroids) and additional major metros rolling out next. Coverage is verified per request: a metro that isn't live yet is declined honestly, never fabricated.

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

- `get_marketing_events` / `get_marketing_places` / `get_marketing_neighborhoods` — catalog feeds; forward an `X-API-Key` header. `get_marketing_neighborhoods` returns the **live-market neighborhood centroids with coordinates and radii** (currently the 35 SF Bay Area hubs; new metros appear here as they go live).

### Search 🔒 *free account*

- `search_smart`, `search_query_router`, `search_embed`, `search_parse_intent`, `search_rerank`, `search_web` — model-backed semantic search. Requires the user token via Google connect.

### Saves & Outings 🔒 *free account*

- `save_outing` — save a dated, neighborhood-bound outing plan to the signed-in user's Saved tab
- `get_my_itinerary` — retrieve the signed-in user's saved itineraries
- `list_saves`, `save_listing`, `unsave_listing`, `list_going`, `mark_going`, `unmark_going`, `get_profile` — saved places, event RSVPs, and the signed-in profile
- `upvote_listing`, `share_local_favorite`, `share_gem` — community signals

Requires the free-account connect. A host connected to the remote URL opens Google sign-in on the first gated call; the npm stdio package opens a browser for the same connect step. Saved plans appear on the Dayplay Saved tab across web and app.

Requires the free-account connect (`https://www.dayplay.io/link`). Saved plans appear on the Dayplay Saved tab across web and app.

Example prompts: *"What's happening in the Mission tonight?"* · *"Build me a Saturday itinerary that never leaves Bernal Heights."* · *"Save this outing to my Dayplay account."*

### Legacy compatibility

The original five names are part of the 40-tool catalog: `get_neighborhoods`, `get_events`, and `get_places` are open. `plan_outing` and `manage_saved_plans` need Google connect. `plan_outing` applies a comma-separated `interests` value as the catalog category filter.

## The Anti-Drift Guarantee

Most local AI answers fail the same way: a "Mission" recommendation lands in Oakland, a "Berkeley" event is actually in San Jose, and a walking itinerary silently requires a bridge crossing.

**Scope:** major metros nationwide, with the SF Bay Area as the flagship live market and additional major metros rolling out next. Live coverage is verified per request — the guarantee is that Dayplay never answers for a place it hasn't verified, not that every metro is live on day one.

**Dayplay receipts:**

- **Spatially verified.** Every place and event result is validated against neighborhood centroid coordinates and radii pulled live from `get_neighborhoods` (currently 35 SF Bay Area hubs; the same check applies to each metro as it comes online).
- **Neighborhood-bound queries.** `neighborhood` is an exact-match binding parameter, not a fuzzy keyword hint — results outside the bound radius are dropped, not ranked down.
- **Zero cross-metro drift.** No Oakland result in a San Francisco query. No Brooklyn result in a Manhattan query. No bridge, tunnel, or cross-river hop presented as a walkable leg.
- **Real-time, not stale.** `get_events` queries verified occurrences by `date`, so "tonight" means tonight — not an SEO page from last season.
- **Out-of-market refusal.** A market that isn't live yet is refused before any upstream call, and the surfaced copy states the coverage boundary rather than returning plausible-but-wrong geography. As new metros go live, the same guard extends to them automatically.
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
├── package.json              # npm metadata (@dayplayai/mcp-server v2.2.2, MIT)
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
