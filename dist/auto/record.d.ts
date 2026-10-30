import type { AutoConfig, Hit } from "../types";
export declare function keysFor(prefix: string, hit: Hit, status: number | undefined, cfg: AutoConfig, inTotal: boolean): string[];
export declare function countsFor(prefix: string, hits: Hit[], status: number | undefined, cfg: AutoConfig, inTotal: boolean): Map<string, number>;
export declare function record(hits: Hit[], status: number | undefined, nowMs: number, inTotal: boolean): void;
