import {
    inferProcedureOutput,
    OmitNeverKeys,
    Procedure,
    ProcedureArgs,
    ProcedureRouterRecord,
    AnyRouter
} from "@trpc/server";

// disable eslint any checks as we don't have access to the actual type
/* eslint-disable @typescript-eslint/no-explicit-any */
type Resolver<TProcedure extends Procedure<any>> = (
    ...args: ProcedureArgs<TProcedure["_def"]>
) => Promise<inferProcedureOutput<TProcedure>>;

type DecorateProcedure<TProcedure extends Procedure<any>> = OmitNeverKeys<{
    query: TProcedure extends { _query: true } ? Resolver<TProcedure> : never;

    mutate: TProcedure extends { _mutation: true }
        ? Resolver<TProcedure>
        : never;

    subscribe: TProcedure extends { _subscription: true }
        ? Resolver<TProcedure>
        : never;
}>;

type assertProcedure<T> = T extends Procedure<any> ? T : never;

export type TRPCClientProxy<TProcedures extends ProcedureRouterRecord> = {
    [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
        ? TRPCClientProxy<TProcedures[TKey]["_def"]["record"]>
        : DecorateProcedure<assertProcedure<TProcedures[TKey]>>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
