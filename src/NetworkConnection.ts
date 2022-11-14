export type NetworkConnection = {
    type: string;
    address: string;
    port: number;
    maxRetries: number;
    timeBetweenRetries: number[];
};
