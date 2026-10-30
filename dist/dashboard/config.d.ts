export declare function sanitizeOptions(value: any, key?: string): any;
export declare function configView(): {
    options: any;
    resolved: {
        track: Record<import("..").BuiltInType, boolean>;
        customTypes: string[];
        global: {
            total: boolean;
            perType: boolean;
        };
        failures: boolean;
        ignore: {
            paths: string[];
            methods: string[];
            bots: boolean;
        };
        limits: {
            maxNamesPerType: number;
            collapseAfter: number;
        };
        timeConfig: Record<import("..").TimeBucket, {
            enable: boolean;
            expiry_in_sec: number;
        }>;
    };
    defaults: {
        track: {
            [k: string]: boolean;
        };
        global: {
            total: boolean;
            perType: boolean;
        };
        failures: boolean;
        ignore: {
            paths: never[];
            methods: string[];
            bots: boolean;
        };
        limits: {
            maxNamesPerType: number;
            collapseAfter: number;
        };
        timeConfig: Record<import("..").TimeBucket, {
            enable: boolean;
            expiry_in_sec: number;
        }>;
    };
};
