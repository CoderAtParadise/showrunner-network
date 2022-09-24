import { Service, ServiceIdentifier } from "./ServiceManager.js";
import { ResponsePacket } from "multicast-dns";
import { mdns } from "./Setup.js";
import { booleanReturn } from "./AsyncUtils.js";

export type ServiceInfo = {
    host: string;
    alive: boolean;
    lastRetrieved: number;
};

export class ServiceDiscovery implements Service<ServiceInfo> {
    constructor(
        id: string,
        retry?: { maxRetries: number; timeBetweenRetries: number[] }
    ) {
        this._id = id;
        this._retry = retry || { maxRetries: 10, timeBetweenRetries: [10000] };
    }

    identifier(): ServiceIdentifier {
        return `mdns:${this._id}`;
    }

    retry(): { maxRetries: number; timeBetweenRetries: number[] } {
        return this._retry;
    }

    name(): string {
        return this._id;
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
                    if (r.name.includes("showrunner.local")) {
                        if (r.name.includes(this._id)) {
                            if (r.type === "A") this._host = r.data;
                        }
                    }
                });
                /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                if (this._host !== "" ) {
                    this._lastRetrieved = Date.now();
                    clearTimeout(timeout);
                    resolve(true);
                }
            });
        });
        mdns.query(`${this._id}.showrunner.local`, "A");
        return await open;
    }

    isOpen(): boolean {
        return this._host !== "" && this._alive;
    }

    async close(): Promise<boolean> {
        return await booleanReturn(true);
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
                    if (r.name.includes("showrunner.local")) {
                        if (r.name.includes(this._id)) {
                            if (r.type === "A") this._host = r.data;
                        }
                    }
                });
                /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
                if (this._host !== "") {
                    this._lastRetrieved = Date.now();
                    clearTimeout(timeout);
                    resolve(true);
                }
            });
        });
        mdns.query(`${this._id}.showrunner.local`, "A");
        return await open;
    }

    get(): ServiceInfo {
        return {
            host: this._host,
            alive: this.isOpen(),
            lastRetrieved: this._lastRetrieved
        };
    }

    data(): void {
        // NOOP
    }

    configure(newSettings?: object): object {
        if ((newSettings as ServiceInfo)?.alive)
            this._alive = (newSettings as ServiceInfo).alive;

        return {
            id: this._id,
            retry: this.retry(),
            name: this.name(),
            host: this._host,
            alive: this._alive
        };
    }

    update(): void {
        // NOOP
    }

    tryCounter: number = 0;
    private _id: string;
    private _retry: { maxRetries: number; timeBetweenRetries: number[] };
    private _host: string = "";
    private _alive: boolean = false;
    private _lastRetrieved: number = -1;
}
