import type { AutoConfig, TimeBucket } from "../types";
export declare const TIME_BUCKETS: TimeBucket[];
export declare const RANGE: Record<TimeBucket, number>;
export declare class BadRequest extends Error {
}
export declare function bucketIds(bucket: TimeBucket, n: number, now?: number): string[];
export declare function getMany(keys: string[]): Promise<number[]>;
export declare function config(): {
    cfg: AutoConfig;
    buckets: TimeBucket[];
};
export declare function seriesMany(wanted: [string, TimeBucket, number][], now: number): Promise<{
    bucket: TimeBucket;
    ids: string[];
    counts: number[];
}[]>;
export declare function typesOf(cfg: AutoConfig): string[];
export declare function overview(range: string | null, now?: number): Promise<{
    prefix: string;
    buckets: TimeBucket[];
    global: {
        total: boolean;
        perType: boolean;
    };
    chart: {
        bucket: TimeBucket;
        ids: string[];
        counts: number[];
    };
    sec: number[] | null;
    secIds: string[] | null;
    sparkIds: string[] | null;
    now: {
        perSec: number | null;
        min: number | null;
        prevMin: number | null;
        hour: number | null;
        day: number | null;
        yesterday: number | null;
    };
    types: {
        type: string;
        perSec: number | null;
        min: number;
        day: number;
        spark: number[];
        chart: number[];
    }[];
}>;
export declare function routesOf(prefix: string, type: string, buckets: TimeBucket[], now: number): Promise<{
    action: string;
    name: string;
}[]>;
export declare function typeView(typeParam: string | null, range: string | null, now?: number): Promise<{
    type: string;
    buckets: TimeBucket[];
    failures: boolean;
    chart: {
        bucket: TimeBucket;
        ids: string[];
        counts: number[];
    };
    perSec: number | null;
    now: {
        min: number | null;
        day: number | null;
    };
    routes: {
        min: number | null;
        hour: number | null;
        day: number | null;
        errors: number | null;
        action: string;
        name: string;
    }[];
}>;
export declare function routeView(q: URLSearchParams, now?: number): Promise<{
    key: string;
    buckets: TimeBucket[];
    failures: boolean;
    tiles: {
        bucket: TimeBucket;
        current: number;
        spark: number[];
        ids: string[];
        expiry: number;
    }[];
    chart: {
        errors: number[] | null;
        bucket: TimeBucket;
        ids: string[];
        counts: number[];
    };
}>;
