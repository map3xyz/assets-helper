import { Database } from "sqlite3";
import { NetworkInfo } from "../model";
import { getNetworks, getAssetsForNetwork } from "../networks";
import { MOCK_NETWORKS } from "./networks.json";

type NetworkInfoCallback = (networkInfo: NetworkInfo) => Promise<void>;

export async function networksForEach(db: Database, callback: NetworkInfoCallback, complete?: () => Promise<void>) {
  try {
    const networks = await getNetworks();
    await Promise.all(networks.map(async network => {
      return callback(network);
    }));

    if (complete) {
      await complete();
    }

  } catch (err) {
    throw err;
  }
}

export async function networkForId(db: Database, id: string, callback: NetworkInfoCallback) {
    try {
      const networks = await getNetworks();
      const network = networks.find((network) => network.networkId === id);
      return callback(network);

    } catch (err) {
      throw err;
    }
}

export async function findNetworkByNetworkId(db: Database, networkId: string, callback: NetworkInfoCallback) {
  const networks = await getMockNetworks();
  const network = networks.find((network) => network.networkId === networkId);

  return callback(network);
}

async function getMockNetworks(networkId?: string): Promise<NetworkInfo[]> {
  // @ts-ignore
  return (networkId ? MOCK_NETWORKS.filter((n) => n.networkId === networkId) : MOCK_NETWORKS) as NetworkInfo[];
}

