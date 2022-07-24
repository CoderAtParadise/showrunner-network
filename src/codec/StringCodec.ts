import { Codec, serializeTypes } from "./Codec.js";

export const StringCodec: Codec<string> = {
    serialize(obj: string): string {
        return obj;
    },
    deserialize(json: serializeTypes): string {
        return json as string;
    }
};
