import { createServiceRoute, startTRPCService, setupTRPCClient, announce } from "./Setup.js";
import { ServiceManager,serviceManager } from "./ServiceManager.js";
import { ServiceDiscovery } from "./ServiceDiscovery.js";
import { ServiceTRPC } from "./ServiceTRPC.js";
import { FlattenRouter } from "@trpc/client";

export {
    announce,
    createServiceRoute,
    startTRPCService,
    setupTRPCClient,
    ServiceManager,
    serviceManager,
    ServiceDiscovery,
    ServiceTRPC,
    FlattenRouter // Forward Flatten Router
};
