import {
    createTRPCClient,
    createTRPCClientProxy,
    createWSClient,
    FlattenRouter,
    httpBatchLink,
    httpLink,
    splitLink,
    wsLink
} from "@trpc/client";
import { AnyRouter } from "@trpc/server";
import { ServiceDiscovery, ServiceInfo } from "./ServiceDiscovery.js";
import { serviceManager, Service } from "./ServiceManager.js";

export class ServiceTRPC<Router extends AnyRouter> implements Service<FlattenRouter<Router>> {
    constructor(
        id: string,
        retry?: { maxRetries: number; timeBetweenRetries: number[] }
    ) {
        this.id = id;
        this.name = id;
        this.retry = retry || { maxRetries: 10, timeBetweenRetries: [10000] };
        serviceManager.registerSource(new ServiceDiscovery(this.id, retry));
    }

    async open(): Promise<boolean> {
        if (this.serviceInfo === undefined) {
            const mdnsOpen = await serviceManager.openSource(`mdns:${this.id}`);
            if (mdnsOpen) {
                this.serviceInfo = serviceManager.get<ServiceInfo>(
                    `mdns:${this.id}`
                );
            }
        } else if (Date.now() - this.serviceInfo.lastRetrieved > 5000) {
            const mdnsRestart = await serviceManager
                .getSource(`mdns:${this.id}`)
                ?.restart();
            if (mdnsRestart) {
                this.serviceInfo = serviceManager.get<ServiceInfo>(
                    `mdns:${this.id}`
                );
            }
        }
        const open = new Promise<boolean>((resolve) => {
            const wsClient = createWSClient({
                url: `ws://${this.serviceInfo!.address}:${
                    this.serviceInfo!.port
                }`
            });
            this.websock = wsClient.getConnection();
            this.websock.addEventListener("open", () => {
                this.serviceInfo!.alive = true;
            });
            this.websock.addEventListener("close", () => {
                this.serviceInfo!.alive = false;
            });
            this.websock.addEventListener("error", () => {
                this.serviceInfo!.alive = false;
            });
            const client = createTRPCClient<Router>({
                links: [
                    splitLink({
                        condition(op) {
                            return op.type === "subscription";
                        },
                        true: wsLink({ client: wsClient }),
                        false: splitLink({
                            condition(op) {
                                return op.context.skipBatch === this.true;
                            },
                            true: httpLink({
                                url: `http://${this.serviceInfo!.address}:${
                                this.serviceInfo!.port
                                }`
                            }),
                            false: httpBatchLink({
                                url: `http://${this.serviceInfo!.address}:${this.serviceInfo!.port}`,
                                maxURLLength: 2083
                            })
                        })
                    })
                ]
            });
            this.trpcClient = createTRPCClientProxy(
                client
            ) as FlattenRouter<Router>;
            resolve(true);
        });
        return await open;
    }

    isOpen(): boolean {
        return this.trpcClient !== undefined;
    }

    close(): void {
        this.websock?.close();
    }

    restart(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    get(): FlattenRouter<Router> | undefined {
        return this.trpcClient;
    }

    configure(): object {
        throw new Error("Method not implemented.");
    }

    data() {
        throw new Error("Method not implemented.");
    }

    update(): void {
        throw new Error("Method not implemented.");
    }

    id: string;
    type: string = "trpc";
    name: string;
    retry: { maxRetries: number; timeBetweenRetries: number[] };
    address: string = "";
    port: number = -1;
    tryCounter: number = 0;
    websock: WebSocket | undefined;
    trpcClient: FlattenRouter<Router> | undefined;
    serviceInfo: ServiceInfo | undefined;
}
