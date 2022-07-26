import { DefaultCodec } from "./DefaultCodec.js";

export type serializeTypes =
    | object
    | string
    | number
    | object[]
    | string[]
    | number[];

export interface Codec<T> {
    serialize: (obj: T) => serializeTypes;
    deserialize: (json: serializeTypes, obj?: T) => T;
}

const Codecs: Map<string, Codec<unknown>> = new Map<string, Codec<unknown>>();
const CodecAlias: Map<string, string> = new Map<string, string>();

export const getCodec = (key: string): Codec<unknown> => {
    const codec = Codecs.get(key);
    if (codec) return codec;
    const alias = CodecAlias.get(key);
    if (alias) return getCodec(alias);
    return DefaultCodec;
};

export const registerCodec = (key: string, codec: Codec<unknown>) => {
    Codecs.set(key, codec);
};

export const registerCodecAlias = (key: string, codec: string) => {
    CodecAlias.set(key, codec);
};
