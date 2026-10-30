export declare function sanitize(name: string): string;
export declare function stripQuery(url: string): string;
export declare function matchPath(pattern: string, path: string): boolean;
export declare function normalizeSegment(seg: string): string;
export declare function expressRoute(req: any): string | undefined;
export declare class RouteNamer {
    private collapseAfter;
    private maxNamesPerType;
    private seen;
    private collapsed;
    private names;
    constructor(collapseAfter: number, maxNamesPerType: number);
    pathName(rawPath: string, scope?: string, learn?: boolean): string;
    limit(type: string, name: string): string;
    private guard;
}
export declare function sharedNamer(): RouteNamer;
