import type { RedisClient } from "./redis";
import type { TimeBucket, TimeConfig } from "./types";
export declare function setRedis(client: RedisClient): RedisClient;
export declare function getRedis(): RedisClient | null;
export declare function getRedisOrThrow(): RedisClient;
export declare function getReadyRedis(): Promise<RedisClient>;
export declare function setTimeConfig(cfg: TimeConfig): Record<TimeBucket, {
    enable: boolean;
    expiry_in_sec: number;
}>;
export declare function getTimeConfig(): Record<TimeBucket, {
    enable: boolean;
    expiry_in_sec: number;
}>;
