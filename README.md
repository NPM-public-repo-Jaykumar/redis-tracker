# redis-tracker

## Install

npm:

```bash
npm install redis-tracker
```

yarn:

```bash
yarn add redis-tracker
```

## API

Exports:

- `statis`
- `trackAction`
- `searchKeys`
- `statRedis`

Call `statis.redis.standalone(...)`, `statis.redis.cluster(...)`, or `statis.redis.object(...)` once. After that use `trackAction`, `searchKeys`, and `statRedis` anywhere.

## Connection

Standalone:

```ts
import { statis } from "redis-tracker";

statis.redis.standalone({
  host: "127.0.0.1",
  port: 6379,
});
```

Secure standalone:

```ts
import { statis } from "redis-tracker";

statis.redis.standalone({
  host: "127.0.0.1",
  port: 6379,
  username: "default",
  password: "secret",
});
```

Cluster:

```ts
import { statis } from "redis-tracker";

statis.redis.cluster({
  nodes: [
    { host: "127.0.0.1", port: 7000 },
    { host: "127.0.0.1", port: 7001 },
    { host: "127.0.0.1", port: 7002 },
  ],
});
```

Secure cluster:

```ts
import { statis } from "redis-tracker";

statis.redis.cluster({
  nodes: [
    { host: "127.0.0.1", port: 7000 },
    { host: "127.0.0.1", port: 7001 },
    { host: "127.0.0.1", port: 7002 },
  ],
  username: "default",
  password: "secret",
});
```

Existing standalone object:

```ts
import Redis from "ioredis";
import { statis } from "redis-tracker";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

statis.redis.object(redis, "standalone");
```

Existing cluster object:

```ts
import Redis from "ioredis";
import { statis } from "redis-tracker";

const redis = new Redis.Cluster([
  { host: "127.0.0.1", port: 7000 },
  { host: "127.0.0.1", port: 7001 },
  { host: "127.0.0.1", port: 7002 },
]);

statis.redis.object(redis, "cluster");
```

## Usage

Track:

```ts
import { trackAction } from "redis-tracker";

trackAction({
  prefix: "qa",
  module_name: "swap-tx-rpc",
});
```

Details:

```ts
import { searchKeys, statRedis } from "redis-tracker";

async function getTrackedDetails() {
  const keys = await searchKeys("qa:swap-tx-rpc:*");

  return Promise.all(
    keys.map(async (key) => ({
      key,
      value: Number((await statRedis.get(key)) || 0),
    })),
  );
}
```

## Redis Key Pattern

Module-specific:

```text
{prefix}:{module_name}:{type}:{bucket_id}
```

Example:

```text
qa:swap-tx-rpc:sec:2026-04-15-10-30-45 (expires in 1 hour)
qa:swap-tx-rpc:min:2026-04-15-10-30 (expires in 1 day)
qa:swap-tx-rpc:hour:2026-04-15-10 (expires in 1 day)
qa:swap-tx-rpc:day:2026-04-15 (expires in 30 days)
qa:swap-tx-rpc:month:2026-04 (expires in 180 days)
qa:swap-tx-rpc:year:2026 (expires in 10 years)
```

Global:

```text
{prefix}:global:{type}:{bucket_id}
```

Example:

```text
qa:global:sec:2026-04-15-10-30-45 (expires in 1 hour)
qa:global:min:2026-04-15-10-30 (expires in 1 day)
qa:global:hour:2026-04-15-10 (expires in 1 day)
qa:global:day:2026-04-15 (expires in 30 days)
qa:global:month:2026-04 (expires in 180 days)
qa:global:year:2026 (expires in 10 years)
```

Supported `type` values:

```text
sec
min
hour
day
month
year
```

## Notes

- Global keys are created only from `prefix` and time bucket: `{prefix}:global:{type}:{bucket_id}`.
- If you want one overall global total across multiple APIs/modules, reuse the exact same `prefix` everywhere and change only `module_name`.
- If you change `prefix`, a separate global key series is created for that prefix.

## Demo

- TS StackBlitz: <a href="https://stackblitz.com/edit/stackblitz-starters-r5rdcmc5?file=server.ts" target="_blank" rel="noopener noreferrer">Open TS demo</a>
- JS StackBlitz: <a href="https://stackblitz.com/edit/stackblitz-starters-akuiwtmr?file=server.js" target="_blank" rel="noopener noreferrer">Open JS demo</a>

## Build Package

```bash
npm run build
```

## Local Testing

```bash
npm link
```

In microservice:

```bash
npm link redis-tracker
```

## AI Prompt

````
Read and strictly follow the SKILL.md file to implement the npm package "redis-tracker".

References:
NPM: https://www.npmjs.com/package/redis-tracker
SKILL.md: https://github.com/NPM-public-repo-Jaykumar/redis-tracker/blob/main/SKILL.md
````
