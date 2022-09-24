import multicastdns from "multicast-dns";
import ip from "ip";

export let mdns: multicastdns.MulticastDNS;

export function startMDNS(options?: multicastdns.Options) {
    mdns = multicastdns(options);
    process.on("SIGTERM", () => mdns.destroy());
}

export function announceService(port: number, service: string): void {
    mdns.on("query", (query: multicastdns.QueryPacket) => {
        // disable eslint any checks as we don't have access to the actual type
        /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
        query.questions.forEach((q: any) => {
            if (q.type === "A" && q.name === `${service}-showrunner.local`) {
                mdns.respond([
                    {
                        name: `${service}-showrunner.local`,
                        type: "A",
                        ttl: 300,
                        data: ip.address()
                    }
                ]);
            }
        });
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
    });

    mdns.query({
        questions: [
            {
                name: `${service}-showrunner.local`,
                type: "A"
            }
        ]
    });
}
