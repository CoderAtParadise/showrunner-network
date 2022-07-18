import ws, { WebSocketServer } from "ws";
import { AnyRouter, inferAsyncReturnType, initTRPC } from "@trpc/server";
import multicastdns from "multicast-dns";
import {
    applyWSSHandler,
    CreateWSSContextFnOptions
} from "@trpc/server/adapters/ws";
import {
    CreateHTTPContextOptions,
    createHTTPServer
} from "@trpc/server/adapters/standalone";
import fetch from "node-fetch";
import ip from "ip";

export let mdns: multicastdns.MulticastDNS;

export function startMDNS(options?: multicastdns.Options) {
    mdns = multicastdns(options);
    process.on("SIGTERM", () => mdns.destroy());
}

export function announce(
    port: number,
    service: string,
    options?: multicastdns.Options
): void {
    startMDNS(options);
    mdns.on("query", (query: multicastdns.QueryPacket) => {
        query.questions.forEach((q: any) => {
            if (
                q.type === "A" &&
                q.name === `_${service}-showrunner._tcp.local`
            ) {
                mdns.respond([
                    {
                        name: `_${service}.showrunner`,
                        type: "SRV",
                        data: {
                            port,
                            target: `_${service}-showrunner._tcp.local`
                        }
                    },
                    {
                        name: `_${service}-showrunner._tcp.local`,
                        type: "A",
                        ttl: 300,
                        data: ip.address()
                    }
                ]);
            }
        });
    });
}

export function createServiceRoute(): [
    any,
    (opts: CreateHTTPContextOptions | CreateWSSContextFnOptions) => {}
    ] {
    function createContext(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
    ) {
        return {};
    }
    type Context = inferAsyncReturnType<typeof createContext>;

    const trpc = initTRPC<{ ctx: Context }>()();
    return [trpc, createContext];
}

export function startTRPCService<Router extends AnyRouter>(
    port: number,
    service: string,
    router: Router,
    context: any,
    options?: multicastdns.Options
) {
    const { server, listen } = createHTTPServer({
        router,
        createContext: context
    });
    const wss = new WebSocketServer({ server });
    applyWSSHandler<Router>({
        wss,
        router,
        createContext: context
    });
    listen(port);
    announce(port, service, options);
}

export function setupTRPCClient(mdnsOptions?: multicastdns.Options) {
    startMDNS(mdnsOptions);
    const globalAny = global as any;
    globalAny.fetch = fetch;
    globalAny.WebSocket = ws;
}
