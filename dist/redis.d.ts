import Redis, { Cluster } from "ioredis";
import { RedisStandalone, RedisCluster } from "./types";
export type RedisClient = Redis | Cluster;
export declare const statRedis: RedisClient;
export declare const statis: {
    redis: {
        standalone(cfg: RedisStandalone): RedisClient;
        cluster(cfg: RedisCluster): RedisClient;
        object(redisObject: RedisClient, redisType: "standalone" | "cluster"): RedisClient;
    };
};
