import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LocationEntry {
    lat: number;
    lng: number;
    labelText: string;
    timestamp: bigint;
}
export interface backendInterface {
    createRequest(token: string, labelText: string): Promise<void>;
    getEntries(token: string): Promise<Array<LocationEntry>>;
    submitLocation(token: string, entryLabel: string, lat: number, lng: number): Promise<boolean>;
}
