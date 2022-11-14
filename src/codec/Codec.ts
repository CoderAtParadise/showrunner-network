import { DefaultCodec } from "./DefaultCodec.js";
import { NumberCodec } from "./NumberCodec.js";
import { StringCodec } from "./StringCodec.js";

export type serializeTypes =
    | object
    | string
    | number
    | object[]
    | string[]
    | number[];

/**
 * Interface for serializing and deserializing for networking and file saving
 * @typeParam SerializeType - Type to serialize from
 * @typeParam DeserializeType - Type to deserialize into
 * @public
 */
export interface Codec<SerializeType, DeserializeType = SerializeType> {
    serialize: (obj: SerializeType) => serializeTypes;
    deserialize: (
        json: serializeTypes,
        obj?: DeserializeType,
        additional?: object
    ) => DeserializeType;
}

const Codecs: Map<string, Codec<unknown, unknown>> = new Map<
    string,
    Codec<unknown, unknown>
>();
const CodecAlias: Map<string, string> = new Map<string, string>();

/**
 * Returns the codec with a given key
 * @param key - Codec identifier
 * @returns the {@link Codec} or {@link DefaultCodec} if not found
 */
export const getCodec = (key: string): Codec<unknown, unknown> => {
    registerInBuiltCodecs();
    const codec = Codecs.get(key);
    if (codec) return codec;
    const alias = CodecAlias.get(key);
    if (alias) return getCodec(alias);
    return DefaultCodec;
};

// disable eslint as we want any here to avoid casting to unknown
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

/**
 * Registers a Codec
 * @param key - Codec identifier
 * @param codec - Codec to register
 */
export const registerCodec = (key: string, codec: Codec<any, any>) => {
    registerInBuiltCodecs();
    Codecs.set(key, codec);
};

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

/**
 * Registers an alias for a codec
 * @param alias - Alias identifier for the Codec
 * @param codec - Codec identifier
 */
export const registerCodecAlias = (alias: string, codec: string) => {
    registerInBuiltCodecs();
    CodecAlias.set(alias, codec);
};

function registerInBuiltCodecs() {
    if (!Codecs.has("default")) {
        Codecs.set("default", DefaultCodec);
        Codecs.set("string", StringCodec as Codec<any, any>);
        Codecs.set("number", NumberCodec as Codec<any, any>);
    }
}
