---
name: redis-tracker
description: Use this skill when integrating the `redis-tracker` npm package into an existing codebase, especially to inspect Redis setup, choose the correct startup integration point, place `trackAction(...)` cleanly, and expose read/stat helpers or endpoints.
---

# redis-tracker

Use this skill with the package docs at `https://www.npmjs.com/package/redis-tracker`.

You are helping integrate the npm package `redis-tracker` into a codebase.

## What `redis-tracker` is for

- It stores Redis-based action counters.
- It creates module-level and global usage buckets.
- It is useful for API usage stats, RPC usage stats, route tracking, worker/job tracking, and event analytics.

## Package exports

- `statis`
- `trackAction`
- `searchKeys`
- `statRedis`

## Important API facts

- Redis must be initialized once during startup.
- Setup methods:
- `statis.redis.standalone({ host, port })`
- `statis.redis.standalone({ host, port, username, password })`
- `statis.redis.cluster({ nodes: [{ host, port }, ...] })`
- `statis.redis.cluster({ nodes: [{ host, port }, ...], username, password })`
- `statis.redis.object(existingRedisClient, "standalone")`
- `statis.redis.object(existingRedisCluster, "cluster")`
- Track method:

```ts
trackAction({
  prefix: "qa-server",
  module_name: "profile-view-api",
});
```

- Full track options:

```ts
trackAction({
  prefix: "qa-server",
  module_name: "profile-view-api",
  timestamp_ms: Date.now(),
  per_sec: true,
  per_min: true,
  per_hour: true,
  per_day: true,
  per_month: true,
  per_year: true,
  global_sec: true,
  global_min: true,
  global_hour: true,
  global_day: true,
  global_month: true,
  global_year: true,
});
```

- If the user wants only selected periods like only `hour` / `day` / `month`, disable the rest explicitly, for example:

```ts
trackAction({
  prefix: "qa-server",
  module_name: "profile-view-api",
  per_sec: false,
  per_min: false,
  per_hour: true,
  per_day: true,
  per_month: true,
  per_year: false,
  global_sec: false,
  global_min: false,
  global_hour: true,
  global_day: true,
  global_month: true,
  global_year: false,
});
```

- If bucket flags are omitted, all buckets are enabled by default.
- Do not use the old field name `server`; always use `prefix`.
- Redis key patterns:
- `{prefix}:{module_name}:{type}:{bucket_id}`
- `{prefix}:global:{type}:{bucket_id}`
- Global keys are based only on `prefix`, not `module_name`.
- If one overall global total is desired across multiple APIs/modules, reuse the same stable `prefix` everywhere and change only `module_name`.
- `prefix` must stay a single stable app/environment value such as `qa-server`, `prod-server`, or `payments-api`.
- Never put dynamic values such as `userId`, `walletAddress`, `accountId`, `tenantId`, `chainId`, or `sessionId` inside `prefix`.
- For mixed/specific tracking, keep the same `prefix` and encode the specific identity inside `module_name`.
- Recommended specific `module_name` pattern: `<module_name>:<id_type>:<id_value>`.
- Supported bucket types:
- `sec`
- `min`
- `hour`
- `day`
- `month`
- `year`
- `searchKeys(pattern)` returns matching keys.
- `statRedis` proxies the active Redis client for commands like `get`, `set`, `del`, etc.

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
- Find where request handling actually starts, such as routes, controllers, RPC handlers, workers, jobs, queue consumers, or cron flows.
- Find whether there is already a request context or unique identifier available such as `userId`, `accountId`, `walletAddress`, `tenantId`, `sessionId`, or `chainId`.
- Find whether the project already has analytics/statistics endpoints where `searchKeys(...)` and `statRedis.get(...)` can fit naturally.
- Find whether the project is UI-only or whether a backend/API layer exists where a Redis search/stats API can be added.
- Find whether a `.env` file exists in the project root.
- Find whether the `dotenv` package (or equivalent env loader like `dotenv-flow`, `dotenv-safe`) is already installed and used.
- Tell me all important findings before suggesting code changes.

## Best implementation guidance

- If Redis already exists, the best implementation is usually reusing the existing client with `statis.redis.object(...)`.
- If Redis does not exist yet, initialize `redis-tracker` once in the main startup/bootstrap layer using env variables.
- Prefer common tracking for generic module usage analytics.
- Prefer specific tracking only where user/entity/session scoped visibility is actually required.
- Keep `prefix` single, stable, and meaningful across the app/environment.
- Never encode specific ids inside `prefix`; specific ids must always go inside `module_name`.
- Keep `module_name` stable and readable for common tracking.
- For specific tracking, use a structured `module_name` such as `current-user-api:userId:123` or `wallet-balance-api:walletAddress:0xabc`.
- Do not initialize Redis per request.
- Add `trackAction(...)` where the business action starts, not deep inside random utility code.
- If the project already has a clean middleware/interceptor/controller boundary, recommend the cleanest location and explain why it is the best one.
- Always create a dedicated helper file (e.g., `src/helpers/tracker.ts` or `src/utils/redisTracker.ts`) that exports reusable wrapper functions for `trackAction`, `searchKeys`, and any stat-reading logic. Do not scatter raw `trackAction(...)` calls across the codebase; route them through this helper so configuration stays centralized.
- When a helper file is created, it must own one shared prefix value internally or from config. Do not accept dynamic prefixes from business code.
- If the project is not UI-only and a backend/API layer is available, suggest adding an API to fetch Redis keys using wildcard search and list matching keys with values.

## Environment variable handling

- If Redis is being set up fresh (not reusing an existing client), all connection values (host, port, username, password) must be read from environment variables, never hardcoded.
- Check whether a `.env` file exists in the project root.
- If `.env` exists: append the new Redis env variables to it with sensible default values, for example:

```text
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

- If `.env` does not exist: create it at the project root and add the Redis env variables with default values.
- Check whether `dotenv` (or an equivalent package like `dotenv-flow` or `dotenv-safe`) is already installed and loaded before your entry point runs. If it is not, install `dotenv` and add `import "dotenv/config"` (or `require("dotenv").config()`) at the very top of the main startup/bootstrap file so environment variables are available before any Redis initialization code runs.
- If the project already reads env variables successfully through another mechanism (e.g., a framework-level env loader, NestJS `ConfigModule`, Next.js built-in support), skip adding `dotenv` manually and note why it is not needed.

## First response format

- Start by saying: `I inspected the codebase.`
- Then provide this structure:
- `Found:`
- list whether Redis exists or not
- list the startup/bootstrap/init files you checked
- list the HTTP/RPC/worker/job entry points you found
- list any user/entity/session identifiers already available in the codebase
- list the best common tracking candidates
- list the best specific tracking candidates
- list whether the project is UI-only or backend/API changes are possible
- list whether a `.env` file exists
- list whether `dotenv` or equivalent is already installed and loaded
- `Best path:`
- explain the best Redis integration point
- explain whether to reuse existing Redis with `statis.redis.object(...)` or add new Redis startup wiring with env variables
- explain whether `.env` needs to be created or updated, and what variables will be added
- explain whether `dotenv` needs to be installed or if env loading is already handled
- explain the best place to add `trackAction(...)`
- explain whether a helper file will be created and where
- explain whether read/stat endpoints should be added or attached to existing analytics endpoints
- explain whether a Redis search/list API should be added when backend/API support exists
- `Suggested tracking map:`
- for each important route/API/RPC/job/event, suggest one of:
- `<item>` `(suggested common tracking)`
- `<item>` `(suggested specific tracking using <unique-parameter> in module_name)`

## If no code access exists

- Ask for the startup/bootstrap file, Redis setup file, and the controller/service/worker files that should be tracked.
- Then produce the same response format once enough code is provided.

## Implementation steps to show up front

- `Step-1` Redis integration decision
- `Step-2` Redis mode confirmation or new Redis setup decision
- `Step-3` Module candidates confirmation
- `Step-4` Tracking style decision: common / mixed
- `Step-5` Mixed tracking suggestion confirmation
- `Step-6` Tracking period scope decision
- `Step-7` Unique parameter and `module_name` format decision for specific tracking if needed
- `Step-8` Redis search/stats API decision if backend is possible
- `Step-9` Final confirmation and implementation

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
- `I found an existing Redis setup in <file/path>. Should I reuse this existing Redis connection with statis.redis.object(...)? Reply with "reuse existing" or "add new".`
- If Redis does not exist in the inspected codebase, ask:
- `I did not find an existing Redis setup. Do you want me to add Redis integration for this project? I will read connection values from environment variables and update your .env file accordingly. Reply with "yes" or "no".`
- `Step-2`
- If new Redis setup is needed, ask:
- `Should I implement standalone Redis or cluster Redis? Reply with "standalone" or "cluster".`
- If existing Redis is found but the mode is unclear, inspect and then ask only if still needed.
- `Step-3`
- Based on the codebase inspection, list all routes/RPCs/workers/jobs where tracking makes sense. For each one include a short reason. Format exactly like this:
- `- MODULE_NAME (reason why tracking makes sense here)`
- Then ask: `These are the modules I think are worth tracking. Reply with "all" to confirm all, or list the ones you want to include or exclude.`
- Discuss any changes the user requests, confirm the final list, then move to Step-4.
- `Step-4`
- Ask exactly:
- `What is the requirement for trackAction()? Do you want "common" usage statistics, or "mixed" tracking?`
- `If you choose mixed, prefix will still remain a single stable value and only module_name will carry any specific id.`
- `Reply with "common" or "mixed".`
- `Step-5`
- Present the recommended mix of common and specific tracking targets based on your codebase inspection.
- For every specific target, show the suggested `module_name` format clearly, for example `current-user-api:userId:<value>`.
- Then ask:
- `This is my recommended mixed tracking suggestion. Is this okay, or would you like to make any changes? Reply with "approve" or list the changes.`
- If the user requests changes, discuss and confirm before moving on. Do not proceed until the user explicitly confirms the final tracking map.
- `Step-6`
- Ask:
- `Which time periods do you want to track?`
- `Options: sec / min / hour / day / month / year`
- `You can reply with "all" or a comma-separated list such as "hour,day,month".`
- `Any period not selected will be explicitly set to false so Redis does not store unnecessary buckets.`
- Confirm back the enabled/disabled breakdown and ask for confirmation before proceeding.
- `Step-7`
- If mixed tracking is selected and any modules need specific tracking, ask which unique parameter should be encoded in `module_name`, e.g. `userId`, `walletAddress`, `accountId`, `tenantId`, `chainId`, `sessionId`.
- Ask for the exact `module_name` pattern to use, for example `current-user-api:userId:<value>`.
- Make it explicit that `prefix` will remain unchanged and shared across all modules.
- `Step-8`
- If the project is not UI-only and a backend/API layer exists or can be added, ask:
- `Do you want to create an API to fetch Redis keys with search input using wildcard search, where all matching keys and values are listed? (suggested) Reply with "yes" or "no".`
- If the project is UI-only or backend changes are not possible, skip this step.
- `Step-9`
- Ask for final confirmation before editing code or returning final implementation code.
- Example: `Everything is confirmed. Should I implement this now? Reply with "implement" or "stop".`

## Options

### Option 1. Common module usage

- Use a shared prefix for the app/environment.
- Example:

```ts
trackAction({
  prefix: "qa-server",
  module_name: "profile-view-api",
});
```

- Best when the goal is endpoint/module usage totals.

### Option 2. Mixed tracking

- Use common tracking for most modules.
- Use specific tracking only for selected flows that need more detail.
- Keep one shared stable `prefix` for the whole app/environment.
- Put any specific id only inside `module_name`.
- Example common:

```ts
trackAction({
  prefix: "qa-server",
  module_name: "api-1",
});
```

- Example specific:
 
```ts
trackAction({
  prefix: "qa-server",
  module_name: `current-user-api:userId:${userId}`,
});
```

- Another example specific:

```ts
trackAction({
  prefix: "qa-server",
  module_name: `wallet-balance-api:walletAddress:${walletAddress}`,
});
```

- Best when most analytics are shared, but some flows need finer segmentation while keeping one shared global series per prefix.

## After the user selects an option

- If the user says common usage, use a stable server/app prefix such as `qa-server`, `prod-server`, `payments-api`, or similar.
- If the user says mixed tracking and uniqueness is needed for selected modules, keep the same stable prefix and place the unique parameter in `module_name`.
- Examples of unique parameters:
- `userId`
- `walletAddress`
- `accountId`
- `tenantId`
- `chainId`
- `sessionId`
- Ask which exact unique parameter should be used in `module_name`.
- Ask which exact `module_name` pattern should be used.
- Also suggest which tracked items should stay common and which should become specific.

## Helper file guidance

- Always create a dedicated helper file (e.g. `src/helpers/tracker.ts`, `src/utils/tracker.ts`) aligned to the project's folder conventions.
- All `trackAction(...)`, `searchKeys(...)`, and stat-reading calls in controllers, workers, and services must go through this helper, never call the package directly from business logic.
- The helper must keep one single shared `prefix` value. Do not pass `prefix` from controllers/services on every call.
- Design the helper based on the confirmed tracking style:
- If common only: export a single function like `trackModule(moduleName: string)` that uses a shared prefix internally.
- If mixed: export both variants, one for common modules and one for specific modules that build `module_name` internally while reusing the same shared prefix.
- A good mixed helper shape is `trackModule(moduleName: string)` and `trackSpecific(baseModuleName: string, idType: string, idValue: string | number)`.
- `trackSpecific(...)` should build `module_name` like `<baseModuleName>:<idType>:<idValue>` and must not modify `prefix`.
- Always include a stat-reading helper (e.g. `getModuleStats(moduleName)`) that wraps `searchKeys(...)` and `statRedis.get(...)`.
- If backend/API support exists and the user approves it, add a read API that accepts a wildcard search input, fetches matching Redis keys through `searchKeys(...)`, and returns keys with values through `statRedis.get(...)`.
- Inside every tracking function, explicitly set all period flags (`per_sec`, `per_min`, ..., `global_year`) to `true` or `false` based on the periods confirmed in Step-6. Never omit a flag.

## Implementation rules

- Read the codebase before recommending exact changes when code access exists.
- If code access does not exist, ask for the relevant code or reference files.
- Keep changes minimal and aligned to the project structure.
- Initialize Redis once, never per request.
- If the project already has an `ioredis` client, prefer `statis.redis.object(...)`.
- If Redis is set up fresh, read all connection config from env variables and ensure `.env` is created or updated with defaults.
- Ensure `dotenv` is loaded before Redis initialization if the project does not already handle env loading automatically.
- Add `trackAction(...)` calls only through the helper file, never directly in business logic.
- If analytics/read endpoints are requested, use `searchKeys(...)` and `statRedis.get(...)` through the helper.
- If backend/API support exists, explicitly ask whether a Redis search/list API should be created before implementing it.
- Use stable `module_name` values such as `profile-view-api`, `swap-tx-rpc`, `login-route`, `withdraw-job`, etc.
- If mixed/specific tracking is needed, keep `prefix` unchanged and use structured `module_name` values such as `current-user-api:userId:123` or `wallet-balance-api:walletAddress:0xabc`.
- When listing tracked items, always suggest whether each one should use common tracking or specific tracking.
- When generating the final `trackAction(...)` call in the helper, always explicitly set every period flag (`per_sec`, `per_min`, `per_hour`, `per_day`, `per_month`, `per_year`, `global_sec`, `global_min`, `global_hour`, `global_day`, `global_month`, `global_year`) to either `true` or `false` based on the periods the user confirmed. Never leave any flag omitted; omitting a flag defaults it to `true` and may store unnecessary data in Redis.
- Never propose or generate dynamic prefixes such as `qa-server:${userId}` or `server-name:<unique-parameter>`.

## How to respond

- First inspect or ask questions.
- Then provide all important insights you analyzed from the codebase and explain the best implementation path.
- Then summarize findings and recommend the best implementation path.
- Then show the full step-by-step flow using `Step-1`, `Step-2`, `Step-3`, and so on.
- Then explicitly ask for confirmation.
- Only after confirmation should you write or modify code.
- Do not skip the questioning step.
- Do not assume standalone vs cluster.
- Do not assume common vs specific tracking.
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

Tracked modules:
- <module_name_1> -> <tracking type: common / specific using <param> in module_name>
- <module_name_2> -> <tracking type: common / specific using <param> in module_name>
- ...

Active time periods:
- per_sec: <true/false>
- per_min: <true/false>
- per_hour: <true/false>
- per_day: <true/false>
- per_month: <true/false>
- per_year: <true/false>
- global_sec: <true/false>
- global_min: <true/false>
- global_hour: <true/false>
- global_day: <true/false>
- global_month: <true/false>
- global_year: <true/false>

Helper file created at: <path/to/tracker.ts>
Redis initialized in: <path/to/startup-file>
.env updated/created at: <path/to/.env> (if applicable)
dotenv installed/configured: <yes / not needed - already handled by <framework/loader>>
Stats endpoint available at: <route> (if added)
```
