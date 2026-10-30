import type { TimeBucket } from "../types";
export type Source = {
    kind: "global";
} | {
    kind: "type";
    type: string;
} | {
    kind: "route";
    type: string;
    action: string;
    name: string;
} | {
    kind: "pattern";
    type: string;
    action: string;
    name: string;
};
type Route = {
    type: string;
    action: string;
    name: string;
};
export declare function matchRoutes(type: string, action: string, name: string, now?: number): Promise<Route[]>;
export declare function query(raw: unknown, now?: number): Promise<{
    range: TimeBucket;
    failures: boolean;
    series: any[];
    breakdown: {
        label: string;
        total: number;
        errors: number | null;
        target: Source;
    }[] | undefined;
}>;
export declare function matchView(q: URLSearchParams, now?: number): Promise<{
    key: string;
    routes: {
        day: number;
        type: string;
        action: string;
        name: string;
    }[];
}>;
export {};
