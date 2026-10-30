import type { TimeBucket } from "../types";
type Series = {
    ids: string[];
    counts: number[];
    errors: number[] | null;
};
export type RouteStats = {
    type: string;
    action: string;
    name: string;
    day: number;
    errors: number | null;
    yesterday: number | null;
    series?: Series;
};
export type AnalyzeInput = {
    failures: boolean;
    maxNamesPerType: number;
    dayFraction: number;
    global: {
        ids: string[];
        counts: number[];
        today: number | null;
        yesterday: number | null;
    };
    routes: RouteStats[];
};
export type Severity = "critical" | "warning" | "info";
export type Insight = {
    severity: Severity;
    category: "errors" | "spike" | "drop" | "traffic" | "scale" | "new";
    title: string;
    detail: string;
    value: string;
    target: {
        view: "overview" | "type" | "route";
        type?: string;
        action?: string;
        name?: string;
        range: TimeBucket;
    };
    facts: {
        label: string;
        value: string;
    }[];
    baseline?: number;
    series?: Series;
};
export declare function analyze(input: AnalyzeInput): {
    items: Insight[];
    summary: {
        critical: number;
        warning: number;
        info: number;
    };
};
export declare function topView(now?: number): Promise<{
    routes: {
        type: string;
        action: string;
        name: string;
        day: number;
        min: number;
        share: number;
    }[];
}>;
export declare function insightsView(now?: number): Promise<{
    checked: number;
    generatedAt: number;
    global: {
        ids: string[];
        counts: number[];
    } | null;
    items: Insight[];
    summary: {
        critical: number;
        warning: number;
        info: number;
    };
}>;
export {};
