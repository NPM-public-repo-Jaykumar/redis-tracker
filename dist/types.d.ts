export type TrackOptions = {
    prefix: string;
    module_name: string;
    timestamp_ms?: number;
    per_sec?: boolean;
    per_min?: boolean;
    per_hour?: boolean;
    per_day?: boolean;
    per_month?: boolean;
    per_year?: boolean;
    global_sec?: boolean;
    global_min?: boolean;
    global_hour?: boolean;
    global_day?: boolean;
    global_month?: boolean;
    global_year?: boolean;
};
export type RedisAuth = {
    username?: string;
    password?: string;
};
export type RedisStandalone = RedisAuth & {
    host: string;
    port: number;
};
export type RedisCluster = RedisAuth & {
    nodes: {
        host: string;
        port: number;
    }[];
};
