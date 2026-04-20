import type { RedisClient } from "./redis";
export declare function setRedis(client: RedisClient): RedisClient;
export declare function getRedis(): RedisClient | null;
export declare function getRedisOrThrow(): RedisClient;
export declare function getReadyRedis(): Promise<RedisClient>;
