import { Network } from "../model";
import { getNetworks, getAssetsForNetwork } from "../networks";
import { MOCK_NETWORKS } from "./networks.json";

type NetworkInfoCallback = (networkInfo: Network) => Promise<void>;

export async function networksForEach(callback: NetworkInfoCallback, complete?: () => Promise<void>) {
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

export async function networkForId (id: string, callback: NetworkInfoCallback) {
    try {
      const networks = await getNetworks();
      const network = networks.find((network) => network.id === id);
      return callback(network);

    } catch (err) {
      throw err;
    }
}

export async function findNetworkByNetworkId(networkId: string, callback: NetworkInfoCallback) {
  try {
    const networks = await getNetworks();
    const network = networks.find((network) => network.networkId === networkId);
    return callback(network);

  } catch (err) {
    throw err;
  }
}

async function getMockNetworks(networkId?: string): Promise<Network[]> {
  // @ts-ignore
  return (networkId ? MOCK_NETWORKS.filter((n) => n.networkId === networkId) : MOCK_NETWORKS) as Network[];
}

