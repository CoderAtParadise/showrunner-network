import { announceService, mdns, startMDNS } from "./Setup.js";
import { Service, ServiceIdentifier, ServiceManager, serviceManager } from "./ServiceManager.js";
import { ServiceDiscovery, ServiceInfo } from "./ServiceDiscovery.js";
import * as AsyncUtils from "./AsyncUtils.js";
import {
    IDispatcher,
    MessageType,
    DispatchInfo,
    DispatchReturn,
} from "./IDispatcher.js";
import {trpc} from "./trpc.js";

export {
    mdns,
    announceService,
    startMDNS,
    Service,
    ServiceManager,
    serviceManager,
    ServiceDiscovery,
    AsyncUtils,
    IDispatcher,
    trpc
};

export type { ServiceInfo,ServiceIdentifier, MessageType,DispatchInfo, DispatchReturn };
