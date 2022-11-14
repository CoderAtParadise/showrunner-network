import { booleanReturn } from "./AsyncUtils.js";

export type ServiceIdentifier = `${string}:${string}`; // type:id

export interface Service<T = unknown, Settings = unknown> {
    identifier: () => ServiceIdentifier;
    retry: () => { maxRetries: number; timeBetweenRetries: number[] };
    open: (retryHandler: () => Promise<boolean>) => Promise<boolean>;
    isOpen: () => boolean;
    close: () => Promise<boolean>;
    restart: () => Promise<boolean>;
    get: () => T | undefined;
    config: (newSettings?: Settings) => Settings;
    data: (id: string, dataid?: string) => unknown;
    update: () => void;
    tryCounter: number;
}

export class ServiceManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerSource(source: Service<any, any>) {
        if (!this.sources.has(source.identifier()))
            this.sources.set(source.identifier(), source);
    }

    async openSource(id: string): Promise<boolean> {
        if (!this.sources.get(id)?.isOpen()) {
            const source = this.sources.get(id);
            if (source) {
                const tryOpen = async (): Promise<boolean> => {
                    const open = await source.open(tryOpen);
                    if (!open) {
                        source.tryCounter++;
                        const time =
                            source.tryCounter <
                            source.retry().timeBetweenRetries.length
                                ? source.retry().timeBetweenRetries[
                                      source.tryCounter
                                  ]
                                : source.retry().timeBetweenRetries[
                                      source.retry().timeBetweenRetries.length -
                                          1
                                  ];
                        if (source.tryCounter < source.retry().maxRetries) {
                            return new Promise<boolean>((res) => {
                                setTimeout(() => {
                                    res(tryOpen());
                                }, time);
                            });
                        } else return await booleanReturn(false);
                    } else {
                        source.tryCounter = 0;
                        return await booleanReturn(true);
                    }
                };
                return await tryOpen();
            }
        }
        return await booleanReturn(false);
    }

    isOpen(id: string) {
        return this.sources.get(id)?.isOpen() || false;
    }

    getSource(id: string): Service | undefined {
        return this.sources.get(id);
    }

    get<T>(id: string): T | undefined {
        return this.sources.get(id)?.get() as T;
    }

    startUpdating() {
        this.sources.forEach((v) => v.update());
    }

    removeSource(id: string): boolean {
        return this.sources.delete(id);
    }

    async closeAll(): Promise<string[]> {
        const notClosed = [];
        for (const [id, source] of this.sources) {
            const closed = await source.close();
            if (!closed) notClosed.push(id);
        }
        return notClosed;
    }

    getAllOfType(type: string): Service<unknown>[] {
        const channels: Service<unknown>[] = [];
        this.sources.forEach((value: Service<unknown>) => {
            if (value.identifier().indexOf(type) === 0 && value.isOpen())
                channels.push(value);
        });
        return channels;
    }

    // prettier-ignore
    private sources: Map<string, Service<unknown>> = new Map<string, Service<unknown>>();
}

export const serviceManager = new ServiceManager();
