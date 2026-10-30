import type { AutoConfig, BuiltInType, InitOptions } from "./types";
export declare const BUILT_IN_TYPES: BuiltInType[];
export declare const OFF_BY_DEFAULT: BuiltInType[];
export declare function resolveConfig(options: InitOptions): AutoConfig;
export declare function init(options: InitOptions): void;
