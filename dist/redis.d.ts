import Redis, { Cluster } from "ioredis";
import { InitOptions, RedisStandalone, RedisCluster } from "./types";
export type RedisClient = Redis | Cluster;
export declare const statRedis: RedisClient;
export declare function connectStandalone(cfg: RedisStandalone): RedisClient;
export declare function connectUrl(url: string): RedisClient;
export declare function connectCluster(cfg: RedisCluster): RedisClient;
export declare function connectObject(redisObject: RedisClient, redisType: "standalone" | "cluster"): RedisClient;
export declare const statis: {
    init(options: InitOptions): void;
};
