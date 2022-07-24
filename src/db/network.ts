import { Database } from "sqlite3";
import { NetworkInfo } from "../model";
import { MOCK_NETWORKS } from "./networks.json";

type NetworkInfoCallback = (networkInfo: NetworkInfo) => Promise<void>;

export async function networksForEach(db: Database, callback: NetworkInfoCallback, complete?: () => Promise<void>) {
  const networks = await getMockNetworks();

  await Promise.all(networks.map(async (network) => await callback(network)));

  if (complete) {
    await complete();
  }
}

export async function networkForId(db: Database, id: string, callback: NetworkInfoCallback) {
  const networks = await getMockNetworks();
  const network = networks.find((network) => network.id === id);

  return callback(network);
}

export async function getMockNetworks(networkId?: string): Promise<NetworkInfo[]> {
  // @ts-ignore
  return (networkId ? MOCK_NETWORKS.filter((n) => n.networkId === networkId) : MOCK_NETWORKS) as NetworkInfo[];
}

