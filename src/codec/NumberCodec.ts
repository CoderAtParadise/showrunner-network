import { Codec, serializeTypes } from "./Codec.js";

export const NumberCodec: Codec<number> = {
    serialize(obj: number): number {
        return obj;
    },
    deserialize(json: serializeTypes): number {
        return json as number;
    }
};
