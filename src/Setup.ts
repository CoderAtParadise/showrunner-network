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
        // disable eslint any checks as we don't have access to the actual type
        /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
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
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
    });
}

// disable eslint any checks as we don't have access to the actual type
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
export function createServiceRoute(): [
    any,
    (opts: CreateHTTPContextOptions | CreateWSSContextFnOptions) => unknown
] {
    function createContext() {
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
    // No clue why this error is happenong but this is how it iw meant to be
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

export function setupTRPCClient(mdnsOptions?: multicastdns.Options) {
    startMDNS(mdnsOptions);
    // disable eslint any checks as we don't have access to the actual type
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
    const globalAny = global as any;
    globalAny.fetch = fetch;
    globalAny.WebSocket = ws;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
}
