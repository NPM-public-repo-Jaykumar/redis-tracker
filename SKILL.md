---
name: redis-tracker
description: Use this skill when integrating the `redis-tracker` npm package into an existing codebase, especially to inspect Redis setup, choose the correct startup integration point, turn on automatic request tracking with `statis.init(...)`, choose its options, and expose read/stat helpers or endpoints.
---

# redis-tracker

Use this skill with the package docs at `https://www.npmjs.com/package/redis-tracker`.

You are helping integrate the npm package `redis-tracker` into a codebase.

## What `redis-tracker` is for

- It stores Redis-based request counters per second, minute, hour, day, month and year.
- One `statis.init(...)` call counts every request the app handles automatically: API calls, page views, GraphQL, JSON-RPC, WebSockets, Socket.IO events, SSE and gRPC. Static files and outgoing calls can be turned on.
- There is no manual tracking API. Work that never arrives as a request (cron jobs, queue workers, scripts, business events) is not counted. If the user needs that, tell them redis-tracker only counts incoming requests and, with `OUT`, outgoing calls.

## Package exports

- `statis` (only `statis.init(...)`)
- `searchKeys`
- `statRedis`

## Important API facts

- Call `statis.init(...)` once, at the top of the entry file, before the server starts listening.
- Minimal call:

```ts
import { statis } from "redis-tracker";

statis.init({
  redis: "redis://127.0.0.1:6379",
  prefix: "qa-server",
});
```

- `redis` and `prefix` are passed to `init` directly; the package reads no environment variables.
- `redis` accepts one of:
- a `redis://` or `rediss://` (TLS) URL string, such as `"redis://default:secret@host:6379"`
- `{ host, port, username?, password? }` (standalone)
- `{ nodes: [{ host, port }, ...], username?, password? }` (cluster)
- `{ client: existingIoredisClient, type: "standalone" | "cluster" }` (reuse an existing client)
- All options and defaults:

| Option | Default | What it does |
| --- | --- | --- |
| `redis` | required | Redis connection |
| `prefix` | required | First part of every key; not empty, no `:` |
| `timeConfig` | all buckets on; 1h / 1d / 1d / 30d / 180d / 10y | Buckets to keep and their `expiry_in_sec`, e.g. `{ sec: { enable: false }, day: { expiry_in_sec: 90 * 24 * 60 * 60 } }` |
| `ignore.paths` | `[]` | Paths to skip, e.g. `["/health", "/metrics"]`; `"/admin/*"` matches a subtree |
| `ignore.methods` | `["OPTIONS", "HEAD"]` | Methods to skip |
| `ignore.bots` | `false` | Skip crawlers by user agent |
| `track` | all on except `STATIC` and `OUT` | Turn types on or off: `API`, `WEB`, `GRAPHQL`, `RPC`, `WSS`, `SSE`, `GRPC`, `OTHER`, `STATIC`, `OUT` |
| `global.total` | `true` | `{prefix}:global` keys |
| `global.perType` | `true` | `{prefix}:{TYPE}:global` keys |
| `failures` | `false` | Extra `:5xx` key for responses with status 500 or higher |
| `types` | `[]` | Custom types by path, e.g. `{ path: "/webhooks/*", type: "HOOK" }` |
| `operations` | `[]` | Read an operation name from the body, e.g. `{ path: "/action", type: "ACT", read: (body) => body.action }` |
| `limits.maxNamesPerType` | `200` | Names beyond this are counted as `<other>` |
| `limits.collapseAfter` | `50` | A URL part with more distinct values becomes `<slug>` |
| `name` | — | `(req) => ({ type, action, name })` to name any request yourself |
| `enabled` | `true` | `false` turns tracking off (e.g. in tests) |
| `dashboard` | off | `{ enable: true, url?: "redis-tracker/dashboard", username?, password? }` serves a built-in dashboard from the app's own server |

- Single-page apps (React, Angular, Vue, Next.js): the server sees only the first page load. To count page changes, add `<script src="/redis-tracker/view.js" defer></script>` to the app's HTML (Next.js: `next/script` in `app/layout.tsx` or `pages/_app.tsx`; Angular: `src/index.html`; Vite/CRA: `index.html`; Nuxt: `app.head.script` in `nuxt.config.ts`; SvelteKit: `src/app.html`; Remix/React Router: `app/root.tsx`; anything else: the HTML every page shares). It posts each new path to `/redis-tracker/view`, counted as `WEB`. When the pages come from another origin, use the API server's full URL and add `data-count-first`. Next.js navigation data requests (`RSC: 1`, `/_next/data/`) aren't counted. Server-rendered sites where every link is a full page load don't need the script.

- Key layout:
- `{prefix}:{TYPE}:{ACTION}:{name}:{bucket}:{bucket_id}`
- `{prefix}:{TYPE}:{ACTION}:{name}:5xx:{bucket}:{bucket_id}` (only with `failures: true`)
- `{prefix}:global:{bucket}:{bucket_id}` (all requests; WebSocket messages, Socket.IO events and outgoing calls are not included)
- `{prefix}:{TYPE}:global:{bucket}:{bucket_id}`
- `name` is the route without the leading `/`. Numbers, UUIDs, ObjectIds, long hex strings, `0x` addresses and long tokens become `<id>`. Express routes use their own param names (`/users/:userId` → `users/<userId>`).
- Bucket ids are in IST (UTC+5:30).
- Types:

| TYPE | ACTION | Example key |
| --- | --- | --- |
| `API` | HTTP method | `qa-server:API:GET:api/users/<id>:min:2026-10-29-23-35` |
| `WEB` | HTTP method | `qa-server:WEB:GET:products/<id>:min:…` |
| `GRAPHQL` | `QUERY` / `MUTATION` / `SUBSCRIPTION` | `qa-server:GRAPHQL:QUERY:GetUser:min:…` |
| `RPC` | `CALL` / `NOTIFY` | `qa-server:RPC:CALL:eth_getBalance:min:…` |
| `WSS` | `CONNECT` / `MESSAGE` / `EVENT` | `qa-server:WSS:CONNECT:ws/chat:min:…` |
| `SSE` | HTTP method | `qa-server:SSE:GET:events/prices:min:…` |
| `GRPC` | `CALL` | `qa-server:GRPC:CALL:user.UserService/GetUser:min:…` |
| `OTHER` | HTTP method | `qa-server:OTHER:GET:<unmatched>:min:…` |
| `STATIC` (off) | HTTP method | `qa-server:STATIC:GET:assets/<file>:min:…` |
| `OUT` (off) | HTTP method | `qa-server:OUT:GET:rpc-testnet.supra.com/rpc/v1/block:min:…` |

- GraphQL and JSON-RPC are recognised from `req.body`, so the app must parse JSON bodies (for example `express.json()`). Otherwise those calls count as `API`. This works with Express and NestJS; on Fastify, Koa and Next.js they count as `API`.
- Where to call `statis.init(...)`:
- Express, Fastify, Koa, plain Node: top of `server.ts` / `index.js`
- NestJS: `main.ts`, before `NestFactory.create()`
- Next.js: `instrumentation.ts`, inside `register()`, guarded by `if (process.env.NEXT_RUNTIME === "nodejs")` and loading the package with `await import("redis-tracker")`
- Nuxt, SvelteKit (`adapter-node`), Astro (`@astrojs/node`): code that runs once at server start in the same process, e.g. a Nuxt server plugin or SvelteKit `src/hooks.server.ts`
- `prefix` must stay a single stable app/environment value such as `qa-server`, `prod-server`, or `payments-api`. Never put dynamic values such as `userId`, `walletAddress`, `tenantId` or `sessionId` inside it.
- Use the same `prefix` in every service that should share one `global` total.

### Reading counts

- `searchKeys(pattern)` returns matching keys across standalone or cluster nodes.
- `statRedis` proxies the active Redis client for commands like `get`, `ttl`, `del`.

```ts
const keys = await searchKeys("qa-server:API:*:day:2026-10-29");
const counts = await Promise.all(
  keys.map(async (key) => ({ key, value: Number((await statRedis.get(key)) || 0) })),
);
```

## Workflow

1. Do not immediately edit code.
2. First understand the codebase and ask implementation questions.
3. If you already have code access, inspect the codebase first and tell me what you found.
4. If you find an existing Redis setup, say:
- `I found an existing Redis setup in <file/path>.`
- `This looks like the best integration point for redis-tracker. Can we proceed with this approach?`
5. If you do not have code access, ask me for the relevant startup/init files, Redis config, or Redis service files before recommending changes.
6. Only after my confirmation should you update code or provide final implementation code.

## What to analyze and report before recommending implementation

- Find whether Redis already exists in the codebase.
- Find where Redis is initialized and where the best startup integration point is.
- Find whether the current Redis usage is standalone or cluster.
- Find whether the codebase already uses `ioredis`, a Redis wrapper, a DI container, or a shared service module.
- Find the framework and entry file (Express, Fastify, Koa, NestJS `main.ts`, Next.js `instrumentation.ts`, plain Node).
- Find which kinds of traffic the app serves: REST/JSON APIs, HTML pages, GraphQL, JSON-RPC, WebSockets or Socket.IO, SSE, gRPC, static files, and outgoing calls to other services.
- Find whether JSON bodies are parsed (e.g. `express.json()`), which GraphQL/JSON-RPC detection needs.
- Find health checks, metrics and other noisy paths that should go in `ignore.paths`.
- Find route groups that deserve their own `types` (webhooks, admin) and single-URL endpoints whose operation name sits in a custom body field (`operations`).
- Find work that never arrives as a request (workers, jobs, cron). Report it as not counted by redis-tracker.
- Find whether the project already has analytics/statistics endpoints where `searchKeys(...)` and `statRedis.get(...)` can fit naturally.
- Find whether the project is UI-only or whether a backend/API layer exists where a Redis search/stats API can be added.
- Find where the project keeps its config (env files, a config module, a secrets manager), so a new Redis URL can live with it.
- Tell me all important findings before suggesting code changes.

## Best implementation guidance

- If Redis already exists, reuse the existing client with `statis.init({ redis: { client, type }, prefix })`.
- If Redis does not exist yet, initialize `redis-tracker` once in the main startup/bootstrap layer, passing a Redis URL (or host/port) and `prefix` to `statis.init(...)`.
- Keep `prefix` single, stable, and meaningful across the app/environment.
- Put health checks, metrics and the stats endpoint itself in `ignore.paths`.
- Use `types` to group route families (webhooks, admin) and `operations` for single-URL endpoints whose operation name is in a custom body field.
- Turn on `OUT` only when counting calls to other services is useful (for example RPC providers or payment APIs).
- Turn off time buckets that nobody will read, to reduce Redis writes.
- Do not initialize Redis per request, and call `statis.init(...)` only once.
- Do not add any tracking code to routes, controllers or services.
- If the project is not UI-only and a backend/API layer is available, suggest adding an API to fetch Redis keys using wildcard search and list matching keys with values.

## Connection values

- redis-tracker reads no environment variables. Pass the Redis connection and `prefix` to `statis.init(...)` directly.
- Reuse the project's existing Redis settings (an ioredis client, or a URL or host/port from its config) as they are. Don't rename them or invent new variable names for the tracker.
- If Redis is new to the project, keep its URL with the project's other config. Don't hardcode a password in source, and make sure that config is loaded before `statis.init(...)` runs.

## First response format

- Start by saying: `I inspected the codebase.`
- Then provide this structure:
- `Found:`
- list whether Redis exists or not
- list the framework, entry file and startup/bootstrap files you checked
- list the kinds of traffic found (API, pages, GraphQL, JSON-RPC, WebSockets/Socket.IO, SSE, gRPC, static files, outgoing calls)
- list noisy paths worth ignoring (health checks, metrics)
- list route groups that could become custom `types`, and single-URL endpoints that could use `operations`
- list work that never arrives as a request and so will not be counted
- list whether the project is UI-only or backend/API changes are possible
- list where the project keeps its config
- `Best path:`
- explain where `statis.init(...)` should go and why
- explain whether to reuse existing Redis with `redis: { client, type }` or pass a new Redis URL to `statis.init(...)`, and where that URL will come from
- explain which `statis.init(...)` options you recommend (ignore paths, types to turn on/off, custom types, operations, failures, timeConfig)
- explain whether read/stat endpoints should be added or attached to existing analytics endpoints
- `Suggested tracking map:`
- for each important route family, list the `TYPE` it will be counted under, e.g. `/api/users/* (API)`, `/graphql (GRAPHQL)`, `/ws/chat (WSS)`, `/webhooks/* (custom type HOOK)`

## If no code access exists

- Ask for the startup/bootstrap file, Redis setup file, and the route/controller files.
- Then produce the same response format once enough code is provided.

## Implementation steps to show up front

- `Step-1` Redis integration decision
- `Step-2` Redis mode confirmation or new Redis setup decision
- `Step-3` Tracking options (ignored paths, types on/off, custom types, operations, failures)
- `Step-4` Tracking period scope and expiry decision
- `Step-5` Redis search/stats API decision if backend is possible
- `Step-6` Final confirmation and implementation

## Step questioning rules

- Ask only one step at a time.
- For each step, ask one direct question and clearly tell the user what kind of reply is expected.
- Include a short example reply when useful.
- Do not combine multiple decisions into one question.
- If the user gives a partial answer, confirm what is decided and ask only the missing part.
- Do not move to the next step until the current step is answered clearly.

## What each step should ask

- `Step-1`
- If Redis already exists in the inspected codebase, ask:
- `I found an existing Redis setup in <file/path>. Should I reuse this existing Redis connection with statis.init({ redis: { client, type } })? Reply with "reuse existing" or "add new".`
- If Redis does not exist in the inspected codebase, ask:
- `I did not find an existing Redis setup. Do you want me to add Redis integration for this project? I will pass the Redis URL and prefix to statis.init(...), keeping the URL with your existing config. Reply with "yes" or "no".`
- `Step-2`
- If new Redis setup is needed, ask:
- `Should I implement standalone Redis or cluster Redis? Reply with "standalone" or "cluster".`
- If existing Redis is found but the mode is unclear, inspect and then ask only if still needed.
- `Step-3`
- Show the `statis.init(...)` options you recommend from the inspection: paths for `ignore.paths`, whether to turn `STATIC` or `OUT` on or any other type off, any `types` or `operations`, and whether to enable `failures`.
- Then ask: `These are the tracking settings I recommend. Reply with "approve" or list the changes.`
- `Step-4`
- Ask:
- `Which time periods do you want to track?`
- `Options: sec / min / hour / day / month / year`
- `You can reply with "all" or a comma-separated list such as "hour,day,month". You can also give an expiry per period, such as "day: 90 days".`
- Periods not selected are set to `enable: false` in `timeConfig` so Redis does not store unnecessary buckets.
- Confirm back the enabled/disabled breakdown and expiries, and ask for confirmation before proceeding.
- `Step-5`
- If the project is not UI-only and a backend/API layer exists or can be added, ask:
- `Do you want to create an API to fetch Redis keys with search input using wildcard search, where all matching keys and values are listed? (suggested) Reply with "yes" or "no".`
- If the project is UI-only or backend changes are not possible, skip this step.
- `Step-6`
- Ask for final confirmation before editing code or returning final implementation code.
- Example: `Everything is confirmed. Should I implement this now? Reply with "implement" or "stop".`

## Helper file guidance

- A helper file is needed only when stat-reading logic is added.
- Create it aligned to the project's folder conventions (e.g. `src/helpers/stats.ts`, `src/utils/stats.ts`).
- It must keep one shared `prefix` value, the same one passed to `statis.init(...)`.
- Export a stat-reading helper (e.g. `getStats(pattern)`) that wraps `searchKeys(...)` and `statRedis.get(...)`.
- If backend/API support exists and the user approves it, add a read API that accepts a wildcard search input, fetches matching Redis keys through `searchKeys(...)`, and returns keys with values through `statRedis.get(...)`. Add that API's path to `ignore.paths`.

## Implementation rules

- Read the codebase before recommending exact changes when code access exists.
- If code access does not exist, ask for the relevant code or reference files.
- Keep changes minimal and aligned to the project structure.
- Call `statis.init(...)` once, at the top of the entry file, before the server listens.
- If the project already has an `ioredis` client, prefer `statis.init({ redis: { client, type }, prefix })`.
- If Redis is set up fresh, pass the connection to `statis.init(...)` directly (a URL string is simplest). Keep a password out of source, with the project's other config, and make sure that config is loaded before `statis.init(...)` runs.
- Do not add tracking calls to routes, controllers, services, workers or jobs; redis-tracker has no manual tracking API.
- If analytics/read endpoints are requested, use `searchKeys(...)` and `statRedis.get(...)` through the helper.
- If backend/API support exists, explicitly ask whether a Redis search/list API should be created before implementing it.
- Never propose or generate dynamic prefixes such as `qa-server:${userId}`.
- In tests, pass `enabled: false` to `statis.init(...)`.
- Only turn on `dashboard` if the user asks for it. Outside local development, always set `dashboard.username` and `dashboard.password`, keep the password with the project's other secrets, and never hardcode it.

## How to respond

- First inspect or ask questions.
- Then provide all important insights you analyzed from the codebase and explain the best implementation path.
- Then summarize findings and recommend the best implementation path.
- Then show the full step-by-step flow using `Step-1`, `Step-2`, `Step-3`, and so on.
- Then explicitly ask for confirmation.
- Only after confirmation should you write or modify code.
- Do not skip the questioning step.
- Do not assume standalone vs cluster.
- Do not assume which paths to ignore or which optional types to turn on.
- Do not proceed without confirmation.
- Ask each step using one short direct question, and tell the user the expected reply format whenever useful.
- If backend/API support exists, include the Redis search/list API question as its own step before final confirmation.
- At the end of the first reply, say:
- `Let's start implementing the above by getting clarity step by step.`
- `I'll ask only Step-1 now, then proceed one by one based on your response.`
- Ask only the `Step-1` question that matches your codebase findings.
- Wait for the user's answer.
- Then ask the next relevant step one by one until enough clarity is collected.

## After all changes are done

- At the very end of the implementation, output a clear success summary in this format:

```text
✅ redis-tracker is implemented successfully.

Tracking:
- statis.init in: <path/to/entry-file>
- prefix: <prefix>
- types tracked: <API, WEB, ... / changes from defaults>
- custom types / operations: <list or none>
- ignored paths: <list or none>
- failures key: <on/off>

Active time periods (timeConfig):
- sec: <on/off, expiry>
- min: <on/off, expiry>
- hour: <on/off, expiry>
- day: <on/off, expiry>
- month: <on/off, expiry>
- year: <on/off, expiry>

Not counted (never arrives as a request): <list of workers/jobs or none>

Helper file created at: <path/to/stats.ts> (if applicable)
Redis connection: <reused client / URL from <where>>
Stats endpoint available at: <route> (if added)
```
