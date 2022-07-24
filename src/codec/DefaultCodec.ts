import { Codec, serializeTypes } from "./Codec.js";

// disable eslint any checks as we don't have access to the actual type
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
export const DefaultCodec: Codec<any> = {
    serialize(obj: any): string {
        return JSON.stringify(obj);
    },
    deserialize(json: serializeTypes): any {
        return JSON.parse(json as string);
    }
};
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
