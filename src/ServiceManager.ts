export interface Service<T = {}> {
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
    data(id: string, dataid?: string): any;
    update(): void;
    tryCounter: number;
}

export class ServiceManager {
    registerSource<T>(source: Service<T>) {
        if (!this.sources.has(source.id)) this.sources.set(`${source.type}:${source.id}`, source);
    }

    async openSource(id: string) {
        if (!this.sources.get(id)?.isOpen()) {
            const source = this.sources.get(id);
            if (source) {
                const tryOpen = async (): Promise<boolean> => {
                    const open = await source.open(tryOpen);
                    if (!open) {
                        source.tryCounter++;
                        // prettier-ignore
                        const time =
                            source.tryCounter < source.retry.timeBetweenRetries.length
                                ? source.retry.timeBetweenRetries[source.tryCounter]
                                : source.retry.timeBetweenRetries[
                                    source.retry.timeBetweenRetries.length - 1
                                ];
                        if (source.tryCounter < source.retry.maxRetries) {
                            // eslint-disable-next-line promise/param-names
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

    getSource(id: string): Service<any> | undefined {
        return this.sources.get(id);
    }

    get<T>(id:string): T | undefined {
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

    getAllOfType(type: string): Service<any>[] {
        const channels: Service<any>[] = [];
        this.sources.forEach((value: Service<any>) => {
            if (value.type === type && value.isOpen()) channels.push(value);
        });
        return channels;
    }

    // prettier-ignore
    private sources: Map<string, Service<any>> = new Map<string, Service<any>>();
}

export const serviceManager = new ServiceManager();
