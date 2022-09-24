export type MessageType = `${string}:${string}`;

export type DispatchReturn = {
    type: MessageType;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ret: any;
};


/**
 * @param type - {@link MessageType} to send
 * @param handler - optional handler to send on
 */
export type DispatchInfo = {
    type: MessageType;
    handler?:string;
}

export interface IDispatcher {
    /**
     * Dispatch a request
     * @param dispatchInfo - {@link DispatchInfo} to send
     * @param args - additional parameters to send with message
     * @returns - {@link DispatchReturn}
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    dispatch: (
        dispatchInfo: DispatchInfo,
        ...args: any
    ) => Promise<DispatchReturn>;

    listen: (dispatchInfo:DispatchInfo,f:(dispatchReturn:DispatchReturn) => void) => void;

    stopListening:(dispatchInfo:DispatchInfo,f:(dispatchReturn:DispatchReturn) => void) => void;
}
