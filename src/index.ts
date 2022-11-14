import {
    Service,
    ServiceIdentifier,
    ServiceManager,
    serviceManager
} from "./ServiceManager.js";
import { NetworkConnection } from "./NetworkConnection.js";
import * as AsyncUtils from "./AsyncUtils.js";
import {
    IDispatcher,
    MessageType,
    DispatchInfo,
    DispatchReturn
} from "./IDispatcher.js";
import * as codec from "./codec/index.js";

export {
    Service,
    ServiceManager,
    serviceManager,
    AsyncUtils,
    IDispatcher,
    codec
};

export type {
    ServiceIdentifier,
    MessageType,
    DispatchInfo,
    DispatchReturn,
    NetworkConnection
};
