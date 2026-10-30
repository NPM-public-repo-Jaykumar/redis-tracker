import type { IncomingMessage } from "node:http";
import type { AutoConfig, Hit } from "../types";
import { RouteNamer } from "./naming";
type Req = IncomingMessage & {
    body?: unknown;
    route?: unknown;
    baseUrl?: string;
};
type Res = {
    statusCode: number;
    getHeader(name: string): unknown;
};
export declare function classifyRequest(req: Req, res: Res, cfg: AutoConfig, namer: RouteNamer, url?: string | undefined): Hit[];
export declare function classifyUpgrade(req: IncomingMessage, cfg: AutoConfig, namer: RouteNamer): Hit[];
export {};
