import type { IncomingMessage, ServerResponse } from "node:http";
export type Capture = {
    body(): string | null;
    bodyCut(): boolean;
    response(): string | null;
};
export declare function capture(req: IncomingMessage, res: ServerResponse, samples: boolean): Capture;
export declare function errorOf(req: IncomingMessage): string | null;
export declare function installErrorHooks(): void;
