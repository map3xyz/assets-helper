import { Database } from "sqlite3";
import { NetworkInfo } from "../model";

type NetworkInfoCallback = (networkInfo: NetworkInfo) => Promise<void>;

export async function forEach(db: Database, callback: NetworkInfoCallback, complete?: () => Promise<void>) {
  const networks = await getMockNetworks();

  networks.map(async (network) => await callback(network));
  if (complete) {
    await complete();
  }
}

async function getMockNetworks(networkId?: string): Promise<NetworkInfo[]> {
  // @ts-ignore
  return (networkId ? MOCK_NETWORKS.filter((n) => n.networkId === networkId) : MOCK_NETWORKS) as NetworkInfo[];
}

