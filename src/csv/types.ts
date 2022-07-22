import { UUID } from "../model";

export type UUIDPointer = `id:${UUID<string>}`;
export type AddressPointer = `address:${string}`;
export type RepoPointer = UUIDPointer | AddressPointer;