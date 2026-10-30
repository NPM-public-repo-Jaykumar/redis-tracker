import { type Period } from "./periods";
type Row = {
    total: number;
    errors: number | null;
};
export type Report = Awaited<ReturnType<typeof buildReport>>;
export type ReportMeta = {
    id: string;
    period: Period;
    label: string;
    range: string;
    createdAt: string;
    total: number;
    errors: number | null;
    format: string;
};
export declare function clearReportCache(): void;
declare function buildReport(period: Period, now: number): Promise<{
    prefix: string;
    period: Period;
    label: string;
    range: string;
    timezone: string;
    generatedAt: string;
    failures: boolean;
    total: number;
    errors: number | null;
    previous: {
        label: string;
        total: number;
    } | null;
    chart: {
        bucket: import("..").TimeBucket;
        ids: string[];
        counts: number[];
    } | null;
    types: {
        total: number;
        errors: number | null;
        type: string;
    }[];
    routeCount: number;
    routes: (Row & {
        type: string;
        action: string;
        name: string;
    })[];
}>;
export declare function reportView(periodParam: string | null, now?: number): Promise<{
    prefix: string;
    period: Period;
    label: string;
    range: string;
    timezone: string;
    generatedAt: string;
    failures: boolean;
    total: number;
    errors: number | null;
    previous: {
        label: string;
        total: number;
    } | null;
    chart: {
        bucket: import("..").TimeBucket;
        ids: string[];
        counts: number[];
    } | null;
    types: {
        total: number;
        errors: number | null;
        type: string;
    }[];
    routeCount: number;
    routes: (Row & {
        type: string;
        action: string;
        name: string;
    })[];
}>;
export declare function saveReport(body: any, now?: number): Promise<{
    meta: ReportMeta;
    report: {
        prefix: string;
        period: Period;
        label: string;
        range: string;
        timezone: string;
        generatedAt: string;
        failures: boolean;
        total: number;
        errors: number | null;
        previous: {
            label: string;
            total: number;
        } | null;
        chart: {
            bucket: import("..").TimeBucket;
            ids: string[];
            counts: number[];
        } | null;
        types: {
            total: number;
            errors: number | null;
            type: string;
        }[];
        routeCount: number;
        routes: (Row & {
            type: string;
            action: string;
            name: string;
        })[];
    };
}>;
export declare function listReports(): Promise<{
    key: string;
    reports: ReportMeta[];
}>;
export declare function getReport(idParam: string | null): Promise<any>;
export declare function deleteReport(idParam: string | null): Promise<{
    ok: boolean;
}>;
export {};
