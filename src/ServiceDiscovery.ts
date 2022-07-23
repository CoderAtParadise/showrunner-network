import { Service } from "./ServiceManager.js";
import { ResponsePacket } from "multicast-dns";
import { mdns } from "./Setup.js";

export type ServiceInfo = {
    address: string;
    port: number;
    alive: boolean;
    lastRetrieved: number;
};

export class ServiceDiscovery implements Service<ServiceInfo> {
    constructor(
        id: string,
        retry?: { maxRetries: number; timeBetweenRetries: number[] }
    ) {
        this.id = id;
        this.name = id;
        this.retry = retry || { maxRetries: 10, timeBetweenRetries: [10000] };
    }

    async open(): Promise<boolean> {
        const open = new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 3000);
            mdns.on("response", (response: ResponsePacket) => {
                // disable eslint any checks as we don't have access to the actual type
                /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                response.answers.forEach((r: any) => {
                    if (r.name.includes("showrunner")) {
                        if (r.name.includes(this.id)) {
                            if (r.type === "A") this.address = r.data;
                            if (r.type === "SRV") this.port = r.data.port;
                        }
                    }
                });
                /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                if (this.address !== "" && this.port !== -1) {
                    this.lastRetrieved = Date.now();
                    clearTimeout(timeout);
                    resolve(true);
                }
            });
        });
        mdns.query(`_${this.id}-showrunner._tcp.local`, "A");
        return await open;
    }

    isOpen(): boolean {
        return this.address !== "" && this.port !== -1 && this.alive;
    }

    close(): void {
        // NOOP
    }

    async restart(): Promise<boolean> {
        const open = new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, 3000);
            mdns.on("response", (response: ResponsePacket) => {
                // disable eslint any checks as we don't have access to the actual type
                /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                response.answers.forEach((r: any) => {
                    if (r.name.includes("showrunner")) {
                        if (r.name.includes(this.id)) {
                            if (r.type === "A") this.address = r.data;
                            if (r.type === "SRV") this.port = r.data.port;
                        }
                    }
                });
                /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                if (this.address !== "" && this.port !== -1) {
                    this.lastRetrieved = Date.now();
                    clearTimeout(timeout);
                    resolve(true);
                }
            });
        });
        mdns.query(`_${this.id}-showrunner._tcp.local`, "A");
        return await open;
    }

    get(): ServiceInfo {
        return {
            address: this.address,
            port: this.port,
            alive: this.isOpen(),
            lastRetrieved: this.lastRetrieved
        };
    }

    data(): void {
        // NOOP
    }

    configure(newSettings?: object): object {
        if ((newSettings as ServiceInfo)?.alive)
            this.alive = (newSettings as ServiceInfo).alive;

        return {
            id: this.id,
            retry: this.retry,
            name: this.name,
            address: this.address,
            port: this.port,
            alive: this.alive
        };
    }

    update(): void {
        // NOOP
    }

    id: string;
    type: string = "mdns";
    name: string;
    retry: { maxRetries: number; timeBetweenRetries: number[] };
    address: string = "";
    port: number = -1;
    tryCounter: number = 0;
    alive: boolean = false;
    lastRetrieved: number = -1;
}
