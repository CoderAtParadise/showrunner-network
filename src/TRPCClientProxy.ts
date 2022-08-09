import { TRPCClientError } from "@trpc/client";
import {
    inferProcedureOutput,
    OmitNeverKeys,
    Procedure,
    ProcedureArgs,
    ProcedureRouterRecord,
    AnyRouter
} from "@trpc/server";
import { inferObservableValue, Unsubscribable } from "@trpc/server/observable";
import { TRPCResultMessage } from "@trpc/server/rpc";

// disable eslint any checks as we don't have access to the actual type
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TRPCSubscriptionObserver<TValue, TError> {
    onStarted: () => void;
    onData: (value: TValue) => void;
    onError: (err: TError) => void;
    onStopped: () => void;
    onComplete: () => void;
}

type Resolver<TProcedure extends Procedure<any>> = (
    ...args: ProcedureArgs<TProcedure["_def"]>
) => Promise<inferProcedureOutput<TProcedure>>;

type SubscriptionResolver<
    TProcedure extends Procedure<any>,
    TRouter extends AnyRouter
> = (
    ...args: [
        input: ProcedureArgs<TProcedure["_def"]>[0],
        opts: ProcedureArgs<TProcedure["_def"]>[1] &
            Partial<
                TRPCSubscriptionObserver<
                    TRPCResultMessage<
                        inferObservableValue<inferProcedureOutput<TProcedure>>
                    >,
                    TRPCClientError<TRouter>
                >
            >
    ]
) => Unsubscribable;

type DecorateProcedure<
    TProcedure extends Procedure<any>,
    TRouter extends AnyRouter
> = OmitNeverKeys<{
    query: TProcedure extends { _query: true } ? Resolver<TProcedure> : never;

    mutate: TProcedure extends { _mutation: true }
        ? Resolver<TProcedure>
        : never;

    subscribe: TProcedure extends { _subscription: true }
        ? SubscriptionResolver<TProcedure, TRouter>
        : never;
}>;

type assertProcedure<T> = T extends Procedure<any> ? T : never;

export type TRPCClientProxy<
    TProcedures extends ProcedureRouterRecord,
    TRouter extends AnyRouter
> = {
    [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
        ? TRPCClientProxy<
              TProcedures[TKey]["_def"]["record"],
              TProcedures[TKey]
          >
        : DecorateProcedure<assertProcedure<TProcedures[TKey]>, TRouter>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
