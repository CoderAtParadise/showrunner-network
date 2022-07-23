export interface Service<T = unknown> {
    readonly id: string;
    readonly type: string;
    retry: { maxRetries: number; timeBetweenRetries: number[] };
    name: string;
    address: string;
    port: number;
    open(retryHandler: () => Promise<boolean>): Promise<boolean>;
    isOpen(): boolean;
    close(): void;
    restart(): Promise<boolean>;
    get(): T | undefined;
    configure(newSettings?: object): object;
    data(id: string, dataid?: string): unknown;
    update(): void;
    tryCounter: number;
}

export class ServiceManager {
    registerSource<T>(source: Service<T>) {
        if (!this.sources.has(source.id))
            this.sources.set(`${source.type}:${source.id}`, source);
    }

    async openSource(id: string) {
        if (!this.sources.get(id)?.isOpen()) {
            const source = this.sources.get(id);
            if (source) {
                const tryOpen = async (): Promise<boolean> => {
                    const open = await source.open(tryOpen);
                    if (!open) {
                        source.tryCounter++;
                        const time =
                            source.tryCounter <
                            source.retry.timeBetweenRetries.length
                                ? source.retry.timeBetweenRetries[
                                      source.tryCounter
                                  ]
                                : source.retry.timeBetweenRetries[
                                      source.retry.timeBetweenRetries.length - 1
                                  ];
                        if (source.tryCounter < source.retry.maxRetries) {
                            return new Promise<boolean>((res) => {
                                setTimeout(() => {
                                    res(tryOpen());
                                }, time);
                            });
                        } else return false;
                    } else {
                        source.tryCounter = 0;
                        return true;
                    }
                };
                return await tryOpen();
            }
        }
    }

    isOpen(id: string) {
        return this.sources.get(id)?.isOpen() || false;
    }

    getSource(id: string): Service<unknown> | undefined {
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

    closeAll() {
        this.sources.forEach((source) => source.close());
    }

    getAllOfType(type: string): Service<unknown>[] {
        const channels: Service<unknown>[] = [];
        this.sources.forEach((value: Service<unknown>) => {
            if (value.type === type && value.isOpen()) channels.push(value);
        });
        return channels;
    }

    // prettier-ignore
    private sources: Map<string, Service<unknown>> = new Map<string, Service<unknown>>();
}

export const serviceManager = new ServiceManager();
