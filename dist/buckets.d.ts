import type { TimeBucket } from "./types";
export declare const BUCKET_IDS: Record<TimeBucket, (ms: number) => string>;
export declare function incr(k: string, ttl: number, count?: number, label?: string): Promise<void>;
export declare function bump(bases: string[] | Map<string, number>, nowMs: number): void;
