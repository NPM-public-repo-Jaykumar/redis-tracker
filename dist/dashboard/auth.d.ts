import type { IncomingMessage } from "node:http";
import type { DashboardConfig } from "../types";
export declare function needsLogin(cfg: DashboardConfig): boolean;
export declare function checkLogin(cfg: DashboardConfig, username: unknown, password: unknown): boolean;
export declare function isSignedIn(cfg: DashboardConfig, req: IncomingMessage, now?: number): boolean;
export declare function sessionCookie(cfg: DashboardConfig, req: IncomingMessage, now?: number): string;
export declare function clearCookie(cfg: DashboardConfig): string;
