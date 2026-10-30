import type { Socket } from "node:net";
export declare const wsNames: WeakMap<Socket, string>;
export declare function installHttpHooks(): void;
