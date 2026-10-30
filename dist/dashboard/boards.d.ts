export declare const MAX_BOARDS_BYTES: number;
export declare class TooLarge extends Error {
}
export type BoardsDoc = {
    boards: {
        id: string;
        name: string;
        widgets: unknown[];
    }[];
    defaultId: string | null;
};
export declare function validBoards(value: any): value is BoardsDoc;
export declare function readBoards(): Promise<{
    key: string;
    boards: {
        id: string;
        name: string;
        widgets: unknown[];
    }[];
    defaultId: string | null;
}>;
export declare function writeBoards(value: unknown): Promise<boolean>;
