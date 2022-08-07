import {
    createServiceRoute,
    startTRPCService,
    setupTRPCClient,
    announce,
    mdns
} from "./Setup.js";
import { ServiceManager, serviceManager } from "./ServiceManager.js";
import { ServiceDiscovery } from "./ServiceDiscovery.js";
import { ServiceTRPC } from "./ServiceTRPC.js";
import { TRPCClientProxy } from "./TRPCClientProxy.js";

export {
    mdns,
    announce,
    createServiceRoute,
    startTRPCService,
    setupTRPCClient,
    ServiceManager,
    serviceManager,
    ServiceDiscovery,
    ServiceTRPC
};

export type { TRPCClientProxy };
