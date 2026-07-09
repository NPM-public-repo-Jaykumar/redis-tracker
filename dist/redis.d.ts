import Redis, { Cluster } from "ioredis";
import { RedisStandalone, RedisCluster, TimeConfig } from "./types";
export type RedisClient = Redis | Cluster;
export declare const statRedis: RedisClient;
export declare const statis: {
    timeConfig(cfg: TimeConfig): Record<import("./types").TimeBucket, {
        enable: boolean;
        expiry_in_sec: number;
    }>;
    redis: {
        standalone(cfg: RedisStandalone): RedisClient;
        cluster(cfg: RedisCluster): RedisClient;
        object(redisObject: RedisClient, redisType: "standalone" | "cluster"): RedisClient;
    };
};
